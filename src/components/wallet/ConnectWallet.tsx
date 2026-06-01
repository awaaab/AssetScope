import { useWallet } from '../../context/WalletContext'

export function ConnectWallet() {
  const { status, error, connect } = useWallet()

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={connect}
        disabled={status === 'connecting'}
        className="connect-btn flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'connecting' ? (
          <>
            <SpinnerIcon />
            Connecting…
          </>
        ) : (
          <>
            <WalletIcon />
            Connect Wallet
          </>
        )}
      </button>

      {status === 'error' && error && (
        <p className="text-sm text-red-400 text-center max-w-xs leading-relaxed">
          {error.includes('MetaMask is not installed') ? (
            <>
              MetaMask not detected.{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="underline text-red-300 hover:text-white transition-colors"
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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
