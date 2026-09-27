import { NO_WALLET_ERROR } from '../../lib/ethereum'
import { useWallet } from '../../context/useWallet'

export function ConnectWallet() {
  const { status, error, connect } = useWallet()

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={connect}
        disabled={status === 'connecting'}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#f4f5f7] px-4 text-sm font-medium text-[#15171c] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9e2ff] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'connecting' ? <SpinnerIcon /> : <WalletIcon />}
        {status === 'connecting' ? 'Connecting wallet' : 'Connect wallet'}
      </button>

      {status === 'error' && error && (
        <p className="max-w-sm rounded-md border border-red-300/20 bg-red-300/[0.06] px-3 py-2 text-xs leading-5 text-red-100/90" role="alert">
          {error === NO_WALLET_ERROR ? (
            <>
              No compatible wallet was found.{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-2 hover:text-white"
              >
                Install MetaMask
              </a>
              {' '}to continue.
            </>
          ) : error}
        </p>
      )}
    </div>
  )
}

function WalletIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6.75h15a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5zM3.75 9.75h16.5M16.5 14.25h.008v.008H16.5v-.008z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M12 3a9 9 0 00-9 9h3a6 6 0 016-6V3z" />
    </svg>
  )
}
