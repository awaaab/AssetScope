import { chainName } from '../../lib/ethereum'
import { useWallet } from '../../context/useWallet'
import type { TokenBalancesState } from '../../hooks/useTokenBalances'
import type { MarketPricesState } from '../../hooks/useMarketPrices'
import { formatUsd, valueToken } from '../../lib/portfolio'

interface TokenBalancesProps extends TokenBalancesState {
  prices: MarketPricesState
}

export function TokenBalances({ status, tokens, prices }: TokenBalancesProps) {
  const { chainId } = useWallet()

  return (
    <div className="glass rounded-xl px-5 py-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-neutral-100">Token Balances</p>
        <p className="text-[11px] text-neutral-500">{chainName(chainId)}</p>
      </div>

      {status === 'loading' && <SkeletonRows />}

      {status === 'unsupported' && (
        <Notice>Token balances aren&apos;t supported on this network yet.</Notice>
      )}

      {status === 'error' && (
        <Notice>Couldn&apos;t load token balances. Switch networks or reconnect to retry.</Notice>
      )}

      {status === 'ready' && tokens.length === 0 && (
        <Notice>No token balances found for this wallet.</Notice>
      )}

      {status === 'ready' && tokens.length > 0 && (
        <ul className="divide-y divide-white/[0.05] mt-2">
          {tokens.map(token => (
            <li key={token.address} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-neutral-200 font-medium leading-tight">{token.name}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-mono-address text-sm text-neutral-200">
                  {token.formatted}
                  <span className="text-neutral-500 ml-1.5">{token.symbol}</span>
                </p>
                <TokenValue token={token} prices={prices} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TokenValue({ token, prices }: { token: TokenBalancesState['tokens'][number]; prices: MarketPricesState }) {
  if (prices.status === 'loading') return <p className="text-[11px] text-neutral-600 mt-1">Loading USD price...</p>
  if (prices.status !== 'ready') return <p className="text-[11px] text-neutral-600 mt-1">USD value unavailable</p>

  const value = valueToken(token, prices.tokenUsdByAddress[token.address.toLowerCase()] ?? null)
  if (value.valueUsd === null) return <p className="text-[11px] text-neutral-600 mt-1">USD value unavailable</p>
  return <p className="text-[11px] text-neutral-500 mt-1">{formatUsd(value.priceUsd, 6)} / {formatUsd(value.valueUsd)}</p>
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-neutral-500 mt-3 mb-1">{children}</p>
}

function SkeletonRows() {
  return (
    <div className="mt-3 mb-1 flex flex-col gap-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-28 rounded bg-white/[0.05] animate-pulse" />
            <div className="h-2.5 w-12 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="h-3.5 w-20 rounded bg-white/[0.05] animate-pulse" />
        </div>
      ))}
    </div>
  )
}
