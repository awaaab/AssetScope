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
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/[0.12] bg-[#071829]/50 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
        <span className="font-mono-address text-[13px] text-slate-300">
          {formatAddress(address)}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-600 hover:text-slate-300 transition-colors ml-0.5"
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <button
        onClick={disconnect}
        className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}
