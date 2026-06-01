export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.ethereum !== 'undefined' &&
    !!window.ethereum.isMetaMask
}
