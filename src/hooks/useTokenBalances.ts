import { useEffect, useState } from 'react'
import { useWallet } from '../context/useWallet'
import { fetchTokenBalances, tokensForChain } from '../lib/tokens'
import type { TokenBalance } from '../types/token'

export type TokenBalancesStatus = 'loading' | 'ready' | 'error' | 'unsupported'

export interface TokenBalancesState {
  status: TokenBalancesStatus
  tokens: TokenBalance[]
}

interface FetchResult {
  key: string
  status: 'ready' | 'error'
  tokens: TokenBalance[]
}

// Results are keyed by (address, chainId): after an account or chain switch
// the stored result no longer matches, so the hook reads as 'loading' until
// the new fetch lands — no stored loading flag, and a stale response can
// never show one account's tokens under another.
export function useTokenBalances(): TokenBalancesState {
  const { address, chainId } = useWallet()
  const [result, setResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    if (!address || !chainId) return
    const list = tokensForChain(chainId)
    if (!list) return

    const key = `${address}:${chainId}`
    let cancelled = false
    fetchTokenBalances(address, list)
      .then(tokens => {
        if (!cancelled) setResult({ key, status: 'ready', tokens })
      })
      .catch(() => {
        if (!cancelled) setResult({ key, status: 'error', tokens: [] })
      })
    return () => {
      cancelled = true
    }
  }, [address, chainId])

  if (!address || !chainId) return { status: 'loading', tokens: [] }
  if (!tokensForChain(chainId)) return { status: 'unsupported', tokens: [] }
  if (!result || result.key !== `${address}:${chainId}`) return { status: 'loading', tokens: [] }
  return { status: result.status, tokens: result.tokens }
}
