import { createContext, useContext } from 'react'
import type { WalletState } from '../types/wallet'

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
}

export const WalletContext = createContext<WalletContextValue | null>(null)

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider>')
  return ctx
}
