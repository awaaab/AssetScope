import { useEffect, useRef, useState } from 'react'
import { chainName } from './lib/ethereum'
import { useWallet } from './context/useWallet'
import { ConnectWallet } from './components/wallet/ConnectWallet'
import { WalletAddress } from './components/wallet/WalletAddress'

export default function App() {
  const { status } = useWallet()
  const isConnected = status === 'connected'

  return (
    <div className="relative min-h-screen bg-[#020c1b] text-slate-100 flex flex-col overflow-hidden">
      {/* Ambient top glow — cyan */}
      <div className="pointer-events-none absolute left-1/2 -top-40 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-cyan-500/[0.08]">
        <div className="flex items-center gap-3">
<span className="text-sm font-medium text-slate-200 tracking-tight">AssetScope</span>
          <span className="text-[10px] text-slate-700 font-mono tracking-widest uppercase select-none">
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
      <div className="inline-flex items-center gap-2 text-[11px] text-slate-600 tracking-widest uppercase font-medium">
        <span className="w-1 h-1 rounded-full bg-cyan-500" />
        Ethereum Portfolio Tracker
      </div>

      <h1 className="text-5xl md:text-[3.75rem] font-bold tracking-[-0.025em] text-slate-50 leading-[1.06]">
        Track every asset.<br />
        <span className="text-slate-500">Know your worth.</span>
      </h1>

      <p className="text-slate-500 text-[15px] leading-relaxed max-w-xs">
        Connect your MetaMask wallet for a real-time view of token balances and portfolio value.
      </p>

      <div className="flex flex-col items-center gap-2 mt-1">
        <ConnectWallet />
        <p className="text-[11px] text-slate-700">Non-custodial · Read-only access</p>
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
    <div className="w-full max-w-xl flex flex-col gap-6">
      <div>
        <p className="text-[11px] text-slate-600 uppercase tracking-widest font-medium mb-2">
          ETH Balance
        </p>
        {balance === null ? (
          <div className="h-11 w-40 rounded-lg bg-cyan-500/[0.04] animate-pulse" />
        ) : (
          <p key={flashKey} className="balance-flash text-[2.75rem] font-bold tracking-tight leading-none">
            {balance}
            <span className="text-emerald-800 text-2xl font-semibold ml-2">ETH</span>
          </p>
        )}
        <p className="text-xs text-slate-700 mt-1.5">USD value available in milestone 5</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Tokens', value: '—' },
          { label: 'Networks', value: '—' },
          { label: '24h Change', value: '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-cyan-500/[0.1] hover:border-cyan-500/[0.22] bg-[#071829]/35 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(6,182,212,0.07)] hover:-translate-y-2 transition-all duration-300 ease-out cursor-default px-4 py-3.5"
          >
            <p className="text-[11px] text-slate-600 mb-1.5 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-semibold text-slate-500">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-cyan-500/[0.1] bg-[#071829]/50 backdrop-blur-md px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Token Balances</p>
          <p className="text-[11px] text-slate-600 mt-0.5">On-chain · {chainName(chainId)}</p>
        </div>
        <span className="text-[11px] text-cyan-400 bg-cyan-500/[0.08] border border-cyan-500/[0.15] rounded-full px-2.5 py-1 font-medium">
          Milestone 4
        </span>
      </div>
    </div>
  )
}
