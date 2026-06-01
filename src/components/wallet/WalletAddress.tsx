import { useState } from 'react'
import { formatAddress } from '../../lib/ethereum'
import { useWallet } from '../../context/WalletContext'

export function WalletAddress() {
  const { address, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  if (!address) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="glass-card flex items-center gap-2.5 px-4 py-2 rounded-xl border border-emerald-500/20">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
        <span className="font-mono-address text-sm text-slate-300 tracking-wide">
          {formatAddress(address)}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-500 hover:text-slate-200 transition-colors ml-0.5"
          title={copied ? 'Copied!' : 'Copy full address'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <button
        onClick={disconnect}
        className="text-xs text-slate-500 hover:text-red-400 transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
