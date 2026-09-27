import { useEffect, useMemo, useState } from 'react'
import { useWallet } from '../context/useWallet'
import { fetchMarketPrices, supportsMarketPrices, type MarketPrices } from '../services/priceService'
import type { TokenBalance } from '../types/token'

export type MarketPricesStatus = 'loading' | 'ready' | 'error' | 'unsupported'

export interface MarketPricesState extends MarketPrices {
  status: MarketPricesStatus
  error: string | null
}

const EMPTY_PRICES: MarketPrices = { ethUsd: null, tokenUsdByAddress: {} }

export function useMarketPrices(tokens: TokenBalance[], enabled: boolean): MarketPricesState {
  const { chainId } = useWallet()
  const tokenKey = tokens.map(token => token.address.toLowerCase()).sort().join(',')
  const tokenAddresses = useMemo(() => (tokenKey ? tokenKey.split(',') : []), [tokenKey])
  const key = `${chainId ?? ''}:${tokenKey}`
  const canFetch = enabled && supportsMarketPrices(chainId)
  const [result, setResult] = useState<{ key: string; prices: MarketPrices } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)

  useEffect(() => {
    if (!canFetch) return
    let cancelled = false
    fetchMarketPrices(tokenAddresses)
      .then(prices => {
        if (!cancelled) {
          setResult({ key, prices })
          setFailure(null)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Price request failed.'
          setFailure({ key, message })
        }
      })
    return () => { cancelled = true }
  }, [canFetch, key, tokenAddresses])

  if (!supportsMarketPrices(chainId)) return { status: 'unsupported', error: null, ...EMPTY_PRICES }
  if (!enabled) return { status: 'loading', error: null, ...EMPTY_PRICES }
  if (failure?.key === key) return { status: 'error', error: failure.message, ...EMPTY_PRICES }
  if (!result || result.key !== key) return { status: 'loading', error: null, ...EMPTY_PRICES }
  return { status: 'ready', error: null, ...result.prices }
}
