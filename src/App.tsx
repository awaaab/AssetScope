import { useWallet } from './context/WalletContext'
import { ConnectWallet } from './components/wallet/ConnectWallet'
import { WalletAddress } from './components/wallet/WalletAddress'

export default function App() {
  const { status } = useWallet()
  const isConnected = status === 'connected'

  return (
    <div className="relative min-h-screen overflow-hidden bg-crypto-dark text-slate-100">
      {/* Ambient background orbs */}
      <div className="orb w-[600px] h-[600px] bg-violet-700/20 -top-64 -left-48" />
      <div className="orb w-[500px] h-[500px] bg-cyan-500/15 -bottom-48 -right-32" />

      {/* Dot grid overlay */}
      <div className="bg-dot-grid absolute inset-0 opacity-100 pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 glass-card">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.5)]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">AssetScope</span>
          <span className="hidden sm:inline-block text-xs text-slate-600 border border-white/5 rounded px-1.5 py-0.5">
            v0.1
          </span>
        </div>

        {isConnected && <WalletAddress />}
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-73px)] px-4 text-center">
        {!isConnected ? (
          <DisconnectedHero />
        ) : (
          <ConnectedHero />
        )}
      </main>
    </div>
  )
}

function DisconnectedHero() {
  return (
    <>
      <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        By Awab 
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
        Track Your{' '}
        <span className="gradient-text">Crypto Assets</span>
        <br className="hidden md:block" />
        {' '}in One Place
      </h1>

      <p className="text-slate-400 text-lg mb-10 max-w-md leading-relaxed">
        Connect your wallet to get a real time overview of your portfolio.
      </p>

      <ConnectWallet />

      <p className="mt-4 text-xs text-slate-700">Connect to unlock your dashboard</p>
    </>
  )
}

function ConnectedHero() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.5)]">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold">
        Wallet <span className="gradient-text">Connected</span>
      </h2>
      <p className="text-slate-400 max-w-sm">
        Dashboard features are on the way. Token balances and portfolio analytics are coming in the next milestone.
      </p>
      <div className="glass-card rounded-2xl px-6 py-3 text-sm text-slate-400">
        Milestone 2: Token Balances
        <span className="ml-2 text-sm gradient-text">coming next →</span>
      </div>
    </div>
  )
}
