import { NO_WALLET_ERROR } from '../../lib/ethereum'
import { useWallet } from '../../context/useWallet'

export function ConnectWallet() {
  const { status, error, connect } = useWallet()

  return (
    <div className="flex flex-col items-center gap-2.5">
      <button
        onClick={connect}
        disabled={status === 'connecting'}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-neutral-950 text-sm font-medium transition-colors duration-150 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'connecting' ? (
          <>
            <SpinnerIcon />
            Connecting
          </>
        ) : (
          <>
            <WalletIcon />
            Connect Wallet
          </>
        )}
      </button>

      {status === 'error' && error && (
        <p className="text-xs text-red-400/90 text-center max-w-xs leading-relaxed">
          {error === NO_WALLET_ERROR ? (
            <>
              No wallet detected.{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-red-300 transition-colors"
              >
                Install it here.
              </a>
            </>
          ) : (
            error
          )}
        </p>
      )}
    </div>
  )
}

function WalletIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
