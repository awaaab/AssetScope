import { useEffect, useRef, useState } from 'react'
import { chainName } from './lib/ethereum'
import { useWallet } from './context/useWallet'
import { ConnectWallet } from './components/wallet/ConnectWallet'
import { WalletAddress } from './components/wallet/WalletAddress'

export default function App() {
  const { status } = useWallet()
  const isConnected = status === 'connected'

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-neutral-200 flex flex-col overflow-hidden">
      {/* Single neutral light source + grain — enough for the glass to read */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 -top-64 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-white/[0.035] blur-[120px]" />
        <div className="noise absolute inset-0" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-xl">
        <div className="flex items-baseline gap-2.5">
          <span className="text-sm font-medium text-neutral-100 tracking-tight">AssetScope</span>
          <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase select-none">
            beta
          </span>
        </div>

        {isConnected && <WalletAddress />}
      </nav>

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-12">
        {!isConnected ? <DisconnectedHero /> : <ConnectedView />}
      </main>
    </div>
  )
}

function DisconnectedHero() {
  return (
    <div className="max-w-lg w-full text-center flex flex-col items-center gap-5">
      <p className="text-[11px] text-neutral-500 tracking-widest uppercase font-medium">
        Ethereum Portfolio Tracker
      </p>

      <h1 className="text-5xl md:text-[3.75rem] font-bold tracking-[-0.025em] text-neutral-50 leading-[1.06]">
        Track every asset.<br />
        <span className="text-neutral-600">Know your worth.</span>
      </h1>

      <p className="text-neutral-500 text-[15px] leading-relaxed max-w-xs">
        Connect your MetaMask wallet for a real-time view of token balances and portfolio value.
      </p>

      <div className="flex flex-col items-center gap-2.5 mt-1">
        <ConnectWallet />
        <p className="text-[11px] text-neutral-600">Non-custodial · Read-only access</p>
      </div>
    </div>
  )
}

function ConnectedView() {
  const { balance, chainId } = useWallet()
  const [flashKey, setFlashKey] = useState(0)
  const prevBalance = useRef<string | null>(null)

  useEffect(() => {
    if (balance !== null && balance !== prevBalance.current) {
      setFlashKey(k => k + 1)
      prevBalance.current = balance
    }
  }, [balance])

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">
      <div className="glass rounded-xl px-6 py-6">
        <p className="text-[11px] text-neutral-500 uppercase tracking-widest font-medium mb-2.5">
          ETH Balance
        </p>
        {balance === null ? (
          <div className="h-11 w-40 rounded-md bg-white/[0.05] animate-pulse" />
        ) : (
          <p key={flashKey} className="balance-flash text-[2.75rem] font-semibold tracking-tight leading-none text-neutral-50">
            {balance}
            <span className="text-neutral-500 text-2xl font-medium ml-2">ETH</span>
          </p>
        )}
        <p className="text-xs text-neutral-600 mt-2.5">USD value available in milestone 5</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tokens', value: '—' },
          { label: 'Networks', value: '—' },
          { label: '24h Change', value: '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="glass rounded-xl hover:border-white/[0.13] transition-colors duration-200 cursor-default px-4 py-3.5"
          >
            <p className="text-[11px] text-neutral-500 mb-1.5 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-medium text-neutral-400">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-100">Token Balances</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">On-chain · {chainName(chainId)}</p>
        </div>
        <span className="text-[11px] text-neutral-400 border border-white/[0.08] rounded-md px-2 py-1 font-medium">
          Milestone 4
        </span>
      </div>
    </div>
  )
}
