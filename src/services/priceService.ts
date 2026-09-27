const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const API_KEY = import.meta.env.VITE_COINGECKO_DEMO_API_KEY?.trim()
const MAX_RETRY_DELAY_MS = 5_000

// AssetScope only prices the Ethereum mainnet contracts below. Contract
// addresses are used instead of symbols so similarly named assets cannot be
// valued as the wrong token. Testnet balances intentionally have no market
// value because they are not redeemable mainnet assets.
const COINGECKO_CONTRACTS: Readonly<Record<string, string>> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0x6b175474e89094c44da98b954eedeac495271d0f': '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0xc02aa39b223fe8d0a0e5c4f27ead9083c756cc2': '0xc02aa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0x514910771af9ca656af840dff83e8264ecf986ca': '0x514910771af9ca656af840dff83e8264ecf986ca',
  '0x1f9840a85d5af5bf1d1762f925bdadc4201f984': '0x1f9840a85d5af5bf1d1762f925bdadc4201f984',
}

interface CoinGeckoUsdResponse {
  [id: string]: { usd?: number }
}

export interface MarketPrices {
  ethUsd: number | null
  tokenUsdByAddress: Record<string, number>
}

export class PriceServiceError extends Error {}

function isUsdPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function retryDelayMs(value: string | null): number {
  if (!value) return 1_000
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1_000, MAX_RETRY_DELAY_MS)
  const dateMs = Date.parse(value)
  return Number.isNaN(dateMs) ? 1_000 : Math.min(Math.max(dateMs - Date.now(), 0), MAX_RETRY_DELAY_MS)
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

async function fetchJson(url: string, attempt = 0): Promise<CoinGeckoUsdResponse> {
  if (!API_KEY) throw new PriceServiceError('CoinGecko API key is not configured.')

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'x-cg-demo-api-key': API_KEY },
  })

  if (response.status === 429 && attempt === 0) {
    await wait(retryDelayMs(response.headers.get('Retry-After')))
    return fetchJson(url, 1)
  }
  if (!response.ok) throw new PriceServiceError(`Price request failed (${response.status}).`)
  return response.json() as Promise<CoinGeckoUsdResponse>
}

export function supportsMarketPrices(chainId: string | null): boolean {
  return chainId?.toLowerCase() === '0x1'
}

export async function fetchMarketPrices(tokenAddresses: string[]): Promise<MarketPrices> {
  const contracts = [...new Set(
    tokenAddresses
      .map(address => COINGECKO_CONTRACTS[address.toLowerCase()])
      .filter((address): address is string => Boolean(address)),
  )]

  const ethRequest = fetchJson(`${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`)
  const tokenRequest = contracts.length === 0
    ? Promise.resolve({} as CoinGeckoUsdResponse)
    : fetchJson(`${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${encodeURIComponent(contracts.join(','))}&vs_currencies=usd`)

  const [ethResult, tokenResult] = await Promise.allSettled([ethRequest, tokenRequest])
  if (ethResult.status === 'rejected' && tokenResult.status === 'rejected') {
    const reason = ethResult.reason instanceof Error ? ethResult.reason.message : 'Price requests failed.'
    throw new PriceServiceError(reason)
  }

  const ethResponse = ethResult.status === 'fulfilled' ? ethResult.value : {}
  const tokenResponse = tokenResult.status === 'fulfilled' ? tokenResult.value : {}
  const tokenUsdByAddress: Record<string, number> = {}
  for (const [address, quote] of Object.entries(tokenResponse)) {
    if (isUsdPrice(quote.usd)) tokenUsdByAddress[address.toLowerCase()] = quote.usd
  }

  return {
    ethUsd: isUsdPrice(ethResponse.ethereum?.usd) ? ethResponse.ethereum.usd : null,
    tokenUsdByAddress,
  }
}
