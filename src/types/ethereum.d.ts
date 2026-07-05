// Extends the global Window type with the EIP-1193 provider wallets inject,
// plus the EIP-6963 announce events used for provider discovery.
declare global {
  interface EthereumProvider {
    isMetaMask?: boolean
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    on: (event: string, handler: (...args: unknown[]) => void) => void
    removeListener: (event: string, handler: (...args: unknown[]) => void) => void
  }

  interface EIP6963ProviderInfo {
    uuid: string
    name: string
    icon: string
    rdns: string
  }

  interface EIP6963ProviderDetail {
    info: EIP6963ProviderInfo
    provider: EthereumProvider
  }

  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent<EIP6963ProviderDetail>
  }

  interface Window {
    ethereum?: EthereumProvider
  }
}

export {}
