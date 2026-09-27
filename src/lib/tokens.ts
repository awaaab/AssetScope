import { BrowserProvider, Contract, formatUnits } from 'ethers'
import type { TokenBalance, TokenInfo } from '../types/token'
import { getProvider } from './ethereum'

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)']

// Curated per-chain lists. Metadata is hardcoded so rendering a balance costs
// one RPC call per token instead of four, and so a malicious token contract
// can't inject arbitrary name/symbol strings into the UI.
const TOKEN_LISTS: Record<string, TokenInfo[]> = {
  // Ethereum mainnet
  '0x1': [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', name: 'Wrapped Bitcoin', symbol: 'WBTC', decimals: 8 },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', name: 'Chainlink', symbol: 'LINK', decimals: 18 },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'Uniswap', symbol: 'UNI', decimals: 18 },
  ],
  // Sepolia testnet
  '0xaa36a7': [
    { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', name: 'Chainlink', symbol: 'LINK', decimals: 18 },
    { address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
  ],
}

export function tokensForChain(chainId: string | null): TokenInfo[] | null {
  if (!chainId) return null
  return TOKEN_LISTS[chainId.toLowerCase()] ?? null
}

// Truncates to 4 decimals from the exact decimal string (no parseFloat
// precision loss), with thousands separators on the whole part.
export function formatTokenAmount(raw: bigint, decimals: number): string {
  const [whole, fraction = ''] = formatUnits(raw, decimals).split('.')
  const truncated = `${BigInt(whole).toLocaleString('en-US')}.${(fraction + '0000').slice(0, 4)}`
  if (raw > 0n && truncated === '0.0000') return '< 0.0001'
  return truncated
}

// Resolves with the tokens that hold a non-zero balance. Individual token
// failures are dropped; only rejects when every lookup failed.
export async function fetchTokenBalances(
  address: string,
  tokens: TokenInfo[],
): Promise<TokenBalance[]> {
  const injected = getProvider()
  if (!injected) throw new Error('No Ethereum wallet detected.')
  // A fresh BrowserProvider per call avoids ethers' cached-network errors
  // after the wallet switches chains.
  const provider = new BrowserProvider(injected)

  const results = await Promise.allSettled(
    tokens.map(async (token): Promise<TokenBalance> => {
      const contract = new Contract(token.address, ERC20_ABI, provider)
      const raw = (await contract.balanceOf(address)) as bigint
      return { ...token, raw, formatted: formatTokenAmount(raw, token.decimals) }
    }),
  )

  const fulfilled = results
    .filter((r): r is PromiseFulfilledResult<TokenBalance> => r.status === 'fulfilled')
    .map(r => r.value)

  if (fulfilled.length === 0 && tokens.length > 0) {
    throw new Error('Failed to fetch token balances.')
  }
  return fulfilled.filter(t => t.raw > 0n)
}
