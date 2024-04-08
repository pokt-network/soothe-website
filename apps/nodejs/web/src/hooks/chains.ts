import type { Transaction } from 'web3-types'
import type { SuggestedGasFee } from '@/types'
import { SupportedChains } from '@/constants/supportedChains'
import { useCallback, useEffect, useState } from 'react'
import DatasourceByChain from '@/datasource/chains'
import {
  BalanceByAddressType,
  ListTransfersByAddressResponse,
  TransferSummary,
} from '@/datasource/chains/base'

interface UseGetBalancesParam {
  addresses: string[]
  chain: SupportedChains
  pollInterval?: number
  dontFetchOnMount?: boolean
}

export const useGetBalances = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [balanceByAddress, setBalanceByAddress] = useState<BalanceByAddressType[]>([])

  const getBalances = useCallback(
    async (addresses: string[], chain: SupportedChains): Promise<BalanceByAddressType[]> => {
      if (!addresses.length) return []

      setIsLoading(true)

      return DatasourceByChain[chain]
        .getAccountsBalance(addresses)
        .then((response) => {
          setError(false)
          setBalanceByAddress(response)
          return response
        })
        .catch((e) => {
          console.error(e)
          setError(true)
          return []
        })
        .finally(() => setIsLoading(false))
    },
    []
  )

  return {
    isLoading,
    error,
    balanceByAddress,
    getBalances,
  }
}

export const useGetAccountBalance = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [balance, setBalance] = useState<number>(null)

  const getBalance = useCallback((address: string, chain: SupportedChains) => {
    setIsLoading(true)

    return DatasourceByChain[chain]
      .getBalance(address)
      .then((response) => {
        setError(false)
        setBalance(response)
        return response
      })
      .catch((e) => {
        console.error(e)
        setError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return {
    isLoading,
    error,
    balance,
    getBalance,
  }
}

export const useListTransfers = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [response, setResponse] = useState<ListTransfersByAddressResponse>(null)

  const listTransfers = useCallback(
    (address: string, chain: SupportedChains, nextCursorPage?: string | number) => {
      setIsLoading(true)

      return DatasourceByChain[chain]
        .listTransfersByAddress(address, 25, nextCursorPage)
        .then((response) => {
          setError(false)
          setResponse((prevState) => {
            const oldItems = prevState?.items || []

            return {
              ...response,
              items: oldItems.concat(response.items),
            }
          })

          return response.items
        })
        .catch((e) => {
          console.error(e)
          setError(true)
        })
        .finally(() => setIsLoading(false))
    },
    []
  )

  return {
    isLoading,
    error,
    response,
    listTransfers,
  }
}

export const useGetTransferFeeByChain = (chain: SupportedChains, getAutomatically = true) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [fee, setFee] = useState<number | SuggestedGasFee>(null)

  const getTransferFeeOfChain = useCallback(
    (transaction?: Transaction) => {
      if (!chain) {
        setFee(null)
        return
      }

      setIsLoading(true)

      DatasourceByChain[chain]
        .getTransferFee(transaction)
        .then((res) => {
          setFee(res)
        })
        .catch(() => setError(true))
        .finally(() => setIsLoading(false))
    },
    [chain]
  )

  useEffect(() => {
    if (getAutomatically) {
      getTransferFeeOfChain()
    }
  }, [getTransferFeeOfChain])

  return { isLoading, error, fee, getTransferFeeOfChain }
}

export const useGetSummaryOfAccount = (address: string, chain: SupportedChains) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [summary, setSummary] = useState<TransferSummary>(null)

  const getSummaryOfAccount = useCallback(() => {
    if (!DatasourceByChain[chain].getTransferMonthSummaryForAccount) return

    setIsLoading(true)

    return DatasourceByChain[chain]
      .getTransferMonthSummaryForAccount(address)
      .then((response) => {
        setError(false)
        setSummary(response)
        return response
      })
      .catch((e) => {
        console.error(e)
        setError(true)
      })
      .finally(() => setIsLoading(false))
  }, [address, chain])

  useEffect(() => {
    getSummaryOfAccount()
  }, [getSummaryOfAccount])

  return {
    isLoading,
    error,
    summary,
    getSummaryOfAccount,
  }
}
