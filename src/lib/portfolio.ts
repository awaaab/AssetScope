import type { TokenBalance } from '../types/token'
import { formatUnits } from 'ethers'

export interface ValuedAsset {
  priceUsd: number | null
  valueUsd: number | null
}

function amountFromRaw(raw: bigint, decimals: number): number | null {
  const amount = Number(formatUnits(raw, decimals))
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function valueAmount(amount: number | null, priceUsd: number | null): ValuedAsset {
  if (amount === null || priceUsd === null) return { priceUsd, valueUsd: null }
  return { priceUsd, valueUsd: amount * priceUsd }
}

export function valueEth(balanceRaw: bigint | null, priceUsd: number | null): ValuedAsset {
  return balanceRaw === null ? valueAmount(null, priceUsd) : valueAmount(amountFromRaw(balanceRaw, 18), priceUsd)
}

export function valueToken(token: TokenBalance, priceUsd: number | null): ValuedAsset {
  return valueAmount(amountFromRaw(token.raw, token.decimals), priceUsd)
}

export function portfolioTotalUsd(values: Array<number | null>): number | null {
  const knownValues = values.filter((value): value is number => value !== null)
  return knownValues.length > 0 ? knownValues.reduce((total, value) => total + value, 0) : null
}

export function formatUsd(value: number | null, maximumFractionDigits = 2): string {
  if (value === null || !Number.isFinite(value)) return 'Unavailable'
  if (value > 0 && value < 10 ** -maximumFractionDigits) {
    return `< $0.${'0'.repeat(maximumFractionDigits - 1)}1`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits,
  }).format(value)
}
