import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { WalletState } from '../types/wallet'
import { isMetaMaskInstalled } from '../lib/ethereum'

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

const INITIAL_STATE: WalletState = {
  address: null,
  status: 'disconnected',
  error: null,
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL_STATE)

  // Keep state in sync when the user switches or disconnects accounts in MetaMask.
  const handleAccountsChanged = useCallback((rawAccounts: unknown) => {
    const accounts = rawAccounts as string[]
    if (accounts.length === 0) {
      setState(INITIAL_STATE)
    } else {
      setState({ address: accounts[0], status: 'connected', error: null })
    }
  }, [])

  useEffect(() => {
    window.ethereum?.on('accountsChanged', handleAccountsChanged)
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [handleAccountsChanged])

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'MetaMask is not installed.',
      }))
      return
    }

    setState(prev => ({ ...prev, status: 'connecting', error: null }))

    try {
      const accounts = (await window.ethereum!.request({
        method: 'eth_requestAccounts',
      })) as string[]
      setState({ address: accounts[0], status: 'connected', error: null })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection rejected.'
      setState({ address: null, status: 'error', error: message })
    }
  }

  const disconnect = () => setState(INITIAL_STATE)

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider>')
  return ctx
}
