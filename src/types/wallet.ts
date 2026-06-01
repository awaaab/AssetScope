export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface WalletState {
  address: string | null
  status: WalletStatus
  error: string | null
}
