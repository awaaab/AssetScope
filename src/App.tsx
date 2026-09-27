import { useWallet } from './context/useWallet'
import { useTokenBalances } from './hooks/useTokenBalances'
import { useMarketPrices } from './hooks/useMarketPrices'
import { formatUsd, portfolioTotalUsd, valueEth, valueToken } from './lib/portfolio'
import { chainName } from './lib/ethereum'
import { ConnectWallet } from './components/wallet/ConnectWallet'
import { WalletAddress } from './components/wallet/WalletAddress'
import { TokenBalances } from './components/tokens/TokenBalances'

export default function App() {
  const { status } = useWallet()

  return (
    <div className="min-h-screen bg-[#0b0d12] text-[#e8eaed]">
      <header className="border-b border-white/[0.08] bg-[#0b0d12]/95">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md border border-white/[0.12] bg-white/[0.06] text-[9px] font-semibold tracking-[-0.08em] text-white">
              AS
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-white">AssetScope</span>
          </div>
          {status === 'connected' && <WalletAddress />}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {status === 'connected' ? <ConnectedView /> : <DisconnectedView />}
      </main>
    </div>
  )
}

function DisconnectedView() {
  return (
    <section className="mx-auto mt-[12vh] w-full max-w-md rounded-xl border border-white/[0.1] bg-[#12151c] p-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] sm:p-8">
      <p className="text-xs font-medium text-[#9aa1ad]">Portfolio overview</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white">Connect your wallet</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#9aa1ad]">
        View your Ethereum balance, supported assets, and current USD value.
      </p>
      <div className="mt-6 border-t border-white/[0.08] pt-5">
        <ConnectWallet />
      </div>
    </section>
  )
}

function ConnectedView() {
  const { balance, balanceRaw, chainId } = useWallet()
  const tokenState = useTokenBalances()
  const priceState = useMarketPrices(tokenState.tokens, tokenState.status === 'ready')
  const ethValue = valueEth(balanceRaw, priceState.ethUsd)
  const tokenValues = tokenState.tokens.map(token =>
    valueToken(token, priceState.tokenUsdByAddress[token.address.toLowerCase()] ?? null).valueUsd,
  )
  const totalValue = portfolioTotalUsd([ethValue.valueUsd, ...tokenValues])

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#12151c]">
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#9aa1ad]">
              <span>Portfolio value</span>
            </div>
            <PortfolioValue status={priceState.status} totalValue={totalValue} />
            <p className="mt-2 text-xs text-[#858d99]">
              {priceState.status === 'ready' ? 'Current market value of priced assets' : 'Market value updates when price data is available'}
            </p>
            <p className="mt-1 text-xs text-[#737b88] sm:hidden">{chainName(chainId)}</p>
          </div>
        </div>
      </section>

      {priceState.status === 'error' && (
        <Notice tone="warning">{priceState.error} On-chain balances remain available.</Notice>
      )}
      {priceState.status === 'unsupported' && (
        <Notice>USD prices are currently available for Ethereum mainnet assets only.</Notice>
      )}

      <TokenBalances
        {...tokenState}
        prices={priceState}
        ethBalance={balance}
        ethPrice={priceState.ethUsd}
        ethValue={ethValue.valueUsd}
      />
    </div>
  )
}

function PortfolioValue({
  status,
  totalValue,
}: {
  status: ReturnType<typeof useMarketPrices>['status']
  totalValue: number | null
}) {
  if (status === 'loading') return <div className="mt-3 h-10 w-48 animate-pulse rounded bg-white/[0.07]" />
  return <p className="numeric mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.15rem]">{formatUsd(totalValue)}</p>
}

function Notice({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'warning' }) {
  const styles = tone === 'warning'
    ? 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100/80'
    : 'border-white/[0.09] bg-white/[0.03] text-[#aeb4be]'

  return <p className={`rounded-lg border px-3 py-2.5 text-xs leading-5 ${styles}`}>{children}</p>
}
