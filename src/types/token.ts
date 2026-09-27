export interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
}

export interface TokenBalance extends TokenInfo {
  raw: bigint
  formatted: string
}
