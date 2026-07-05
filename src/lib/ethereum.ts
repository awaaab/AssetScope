import { formatEther } from 'ethers'

export const NO_WALLET_ERROR = 'No Ethereum wallet detected.'

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// EIP-6963 provider discovery: wallets announce themselves via events instead
// of fighting over window.ethereum, and isMetaMask/rdns can't be silently
// clobbered by whichever extension injected last.
const discovered: EIP6963ProviderDetail[] = []
let discoveryStarted = false

export function startProviderDiscovery(): void {
  if (discoveryStarted || typeof window === 'undefined') return
  discoveryStarted = true
  window.addEventListener('eip6963:announceProvider', (event) => {
    const detail = event.detail
    if (!discovered.some(d => d.info.uuid === detail.info.uuid)) {
      discovered.push(detail)
    }
  })
  window.dispatchEvent(new Event('eip6963:requestProvider'))
}

export function getProvider(): EthereumProvider | undefined {
  const metamask = discovered.find(d => d.info.rdns === 'io.metamask')
  return (metamask ?? discovered[0])?.provider ?? window.ethereum
}

// Truncates to 4 decimals from the exact decimal string, avoiding
// parseFloat precision loss on large balances.
export function formatBalance(wei: bigint): string {
  const [whole, fraction = ''] = formatEther(wei).split('.')
  return `${whole}.${(fraction + '0000').slice(0, 4)}`
}

// EIP-1193 error codes → user-facing text, instead of echoing raw
// provider internals into the UI.
export function walletErrorMessage(err: unknown): string {
  const code = (err as { code?: unknown } | null)?.code
  if (code === 4001) return 'Connection request was rejected.'
  if (code === -32002) return 'A connection request is already pending — open your wallet extension.'
  return 'Failed to connect wallet. Please try again.'
}

const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum mainnet',
  '0xaa36a7': 'Sepolia testnet',
  '0x4268': 'Holesky testnet',
  '0x89': 'Polygon',
  '0xa': 'Optimism',
  '0xa4b1': 'Arbitrum One',
  '0x2105': 'Base',
}

export function chainName(chainId: string | null): string {
  if (!chainId) return '…'
  return CHAIN_NAMES[chainId.toLowerCase()] ?? `Chain ${parseInt(chainId, 16)}`
}
