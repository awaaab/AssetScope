import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserProvider } from 'ethers'
import type { WalletState } from '../types/wallet'
import {
  NO_WALLET_ERROR,
  formatBalance,
  getProvider,
  startProviderDiscovery,
  walletErrorMessage,
} from '../lib/ethereum'
import { WalletContext } from './useWallet'

const INITIAL_STATE: WalletState = {
  address: null,
  status: 'disconnected',
  error: null,
  balance: null,
  chainId: null,
}

startProviderDiscovery()

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL_STATE)
  // True only while the user has an in-app session; wallet events are ignored
  // otherwise so an account switch can't silently "reconnect" after Disconnect.
  const activeRef = useRef(false)
  const addressRef = useRef<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetchBalance = useCallback(async (address: string) => {
    const fetchId = ++fetchIdRef.current
    try {
      const injected = getProvider()
      if (!injected) return
      // A fresh BrowserProvider per call avoids ethers' cached-network errors
      // after the wallet switches chains.
      const provider = new BrowserProvider(injected)
      const raw = await provider.getBalance(address)
      const formatted = formatBalance(raw)
      // Only apply if this is still the latest fetch for the current address,
      // so a slow response can't show one account's balance under another.
      setState(prev =>
        fetchId === fetchIdRef.current && prev.address === address
          ? { ...prev, balance: formatted }
          : prev,
      )
    } catch {
      setState(prev =>
        fetchId === fetchIdRef.current ? { ...prev, balance: null } : prev,
      )
    }
  }, [])

  const readChainId = useCallback(async () => {
    try {
      const chainId = (await getProvider()?.request({ method: 'eth_chainId' })) as string
      setState(prev => (activeRef.current ? { ...prev, chainId } : prev))
    } catch {
      // leave chainId unknown
    }
  }, [])

  const handleAccountsChanged = useCallback((rawAccounts: unknown) => {
    if (!activeRef.current) return
    const accounts = rawAccounts as string[]
    if (accounts.length === 0) {
      activeRef.current = false
      addressRef.current = null
      setState(INITIAL_STATE)
    } else {
      addressRef.current = accounts[0]
      setState(prev => ({
        ...prev,
        address: accounts[0],
        status: 'connected',
        error: null,
        balance: null,
      }))
      fetchBalance(accounts[0])
    }
  }, [fetchBalance])

  const handleChainChanged = useCallback((rawChainId: unknown) => {
    if (!activeRef.current) return
    setState(prev => ({ ...prev, chainId: rawChainId as string, balance: null }))
    if (addressRef.current) fetchBalance(addressRef.current)
  }, [fetchBalance])

  useEffect(() => {
    const provider = getProvider()
    provider?.on('accountsChanged', handleAccountsChanged)
    provider?.on('chainChanged', handleChainChanged)
    return () => {
      provider?.removeListener('accountsChanged', handleAccountsChanged)
      provider?.removeListener('chainChanged', handleChainChanged)
    }
  }, [handleAccountsChanged, handleChainChanged])

  const connect = async () => {
    const provider = getProvider()
    if (!provider) {
      setState(prev => ({ ...prev, status: 'error', error: NO_WALLET_ERROR }))
      return
    }

    setState(prev => ({ ...prev, status: 'connecting', error: null }))

    try {
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[]
      if (!accounts || accounts.length === 0) {
        setState({ ...INITIAL_STATE, status: 'error', error: 'Wallet returned no accounts.' })
        return
      }
      activeRef.current = true
      addressRef.current = accounts[0]
      setState({
        address: accounts[0],
        status: 'connected',
        error: null,
        balance: null,
        chainId: null,
      })
      fetchBalance(accounts[0])
      readChainId()
    } catch (err: unknown) {
      setState({ ...INITIAL_STATE, status: 'error', error: walletErrorMessage(err) })
    }
  }

  const disconnect = () => {
    activeRef.current = false
    addressRef.current = null
    setState(INITIAL_STATE)
    // Revoke the site's account permission so the next connect prompts again.
    // Not all wallets implement this method; failure just means the old
    // (state-reset only) behavior.
    getProvider()
      ?.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] })
      .catch(() => {})
  }

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}
