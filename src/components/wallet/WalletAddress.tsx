import { useState } from 'react'
import { chainName, formatAddress } from '../../lib/ethereum'
import { useWallet } from '../../context/useWallet'

export function WalletAddress() {
  const { address, chainId, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  if (!address) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2_000)
    } catch {
      // Clipboard access may be unavailable in an embedded browser.
    }
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="hidden items-center gap-1.5 text-xs text-[#9aa1ad] sm:flex">
        <span className="size-1.5 rounded-full bg-[#4fba8b]" aria-hidden="true" />
        <span>{chainName(chainId)}</span>
      </div>
      <div className="flex h-9 items-center rounded-lg border border-white/[0.1] bg-white/[0.04] pl-3">
        <span className="font-mono-address text-xs text-[#d5d9df]">{formatAddress(address)}</span>
        <button
          onClick={handleCopy}
          className="ml-1 grid size-8 place-items-center rounded-md text-[#858d99] transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#d9e2ff]"
          aria-label={copied ? 'Wallet address copied' : 'Copy wallet address'}
          title={copied ? 'Copied' : 'Copy address'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <button
        onClick={disconnect}
        className="text-xs font-medium text-[#9aa1ad] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9e2ff]"
      >
        Disconnect
      </button>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="size-3.5 text-[#67c99a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  )
}
