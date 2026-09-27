import { useWallet } from '../../context/useWallet'
import type { TokenBalancesState } from '../../hooks/useTokenBalances'
import type { MarketPricesState } from '../../hooks/useMarketPrices'
import { formatUsd, valueToken } from '../../lib/portfolio'

interface TokenBalancesProps extends TokenBalancesState {
  prices: MarketPricesState
  ethBalance: string | null
  ethPrice: number | null
  ethValue: number | null
}

interface HoldingRowData {
  name: string
  symbol: string
  amount: string | null
  price: number | null
  value: number | null
  native?: boolean
}

export function TokenBalances({
  status,
  tokens,
  prices,
  ethBalance,
  ethPrice,
  ethValue,
}: TokenBalancesProps) {
  const { chainId } = useWallet()
  const holdings: HoldingRowData[] = [
    { name: 'Ethereum', symbol: 'ETH', amount: ethBalance, price: ethPrice, value: ethValue, native: true },
    ...tokens.map(token => {
      const price = prices.tokenUsdByAddress[token.address.toLowerCase()] ?? null
      return {
        name: token.name,
        symbol: token.symbol,
        amount: token.formatted,
        price,
        value: valueToken(token, price).valueUsd,
      }
    }),
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#12151c]">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-white">Holdings</h2>
          <p className="mt-0.5 text-xs text-[#737b88]">Assets detected on the connected network</p>
        </div>
        <span className="numeric text-xs text-[#9aa1ad]">
          {status === 'ready' ? `${holdings.length} ${holdings.length === 1 ? 'asset' : 'assets'}` : 'Updating'}
        </span>
      </div>

      <div className="hidden grid-cols-[minmax(12rem,1.45fr)_minmax(6.5rem,.8fr)_minmax(7rem,.95fr)_minmax(7rem,.95fr)] gap-4 border-b border-white/[0.08] px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.08em] text-[#858d99] sm:grid sm:px-6">
        <span className="text-left">Asset</span>
        <span>Price</span>
        <span>Amount</span>
        <span>Value</span>
      </div>

      {status === 'loading' && <SkeletonRows />}

      {status !== 'loading' && (
        <div className="divide-y divide-white/[0.07]">
          {holdings.map(holding => <HoldingRow key={holding.symbol} holding={holding} prices={prices} />)}
        </div>
      )}

      {status === 'unsupported' && <Notice>Token balances are not supported on this network yet.</Notice>}
      {status === 'error' && <Notice>Token balances could not be loaded. Reconnect or switch networks to retry.</Notice>}
      {status === 'ready' && tokens.length === 0 && <Notice>No additional token holdings found.</Notice>}
      {chainId === null && status !== 'loading' && <Notice>Waiting for network information.</Notice>}
    </section>
  )
}

function HoldingRow({ holding, prices }: { holding: HoldingRowData; prices: MarketPricesState }) {
  const priceText = prices.status === 'ready' ? formatUsd(holding.price, 6) : 'Unavailable'
  const valueText = prices.status === 'ready' ? formatUsd(holding.value) : 'Unavailable'
  const amountText = holding.amount ?? 'Unavailable'

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-5 py-4 sm:grid-cols-[minmax(12rem,1.45fr)_minmax(6.5rem,.8fr)_minmax(7rem,.95fr)_minmax(7rem,.95fr)] sm:items-center sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <AssetMark symbol={holding.symbol} native={holding.native} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#e8eaed]">{holding.name}</p>
          <p className="mt-0.5 text-xs text-[#858d99]">{holding.symbol}</p>
        </div>
      </div>

      <div className="text-right sm:contents">
        <div className="sm:hidden">
          <p className="numeric text-sm font-medium text-white">{valueText}</p>
          <p className="numeric mt-1 text-xs text-[#858d99]">{amountText} {holding.symbol} - {priceText}</p>
        </div>
        <p className="numeric hidden text-right text-sm text-[#aeb4be] sm:block">{priceText}</p>
        <p className="numeric hidden text-right text-sm text-[#d5d9df] sm:block">{amountText}</p>
        <p className="numeric hidden text-right text-sm font-medium text-white sm:block">{valueText}</p>
      </div>
    </div>
  )
}

function AssetMark({ symbol, native }: { symbol: string; native?: boolean }) {
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${native ? 'bg-[#273047] text-[#c8d4ff]' : 'bg-white/[0.07] text-[#c9ced7]'}`}>
      {native ? 'E' : symbol.slice(0, 1)}
    </span>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="border-t border-white/[0.08] px-5 py-3 text-xs leading-5 text-[#858d99] sm:px-6">{children}</p>
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-white/[0.07] px-5 sm:px-6">
      {[0, 1, 2].map(index => (
        <div key={index} className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="size-9 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-2.5 w-10 animate-pulse rounded bg-white/[0.05]" />
            </div>
          </div>
          <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  )
}
