'use client'
import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import type { SuggestedGasFee } from '@/types'
import { useFormContext } from 'react-hook-form'
import React, { createContext, useContext } from 'react'

export type FetchStatus = 'not-fetched' | 'loading' | 'error' | 'fetched'

interface TransferContext {
  fee: number | SuggestedGasFee
  feeFetchStatus?: FetchStatus
  getNetworkFee: () => void
  fromAvailableBalance: number
  getAvailableBalance: () => void
  balanceFetchStatus?: FetchStatus
  feeSelected?: number
}

const TransferContext = createContext<TransferContext>(null)

type TransferContextProviderProps = TransferContext & React.PropsWithChildren

export default function TransferContextProvider({
  children,
  ...contextProps
}: TransferContextProviderProps) {
  const { watch } = useFormContext<TransferFormValues>()

  const feeSpeedSelected = watch('feeSpeedSelected')

  return (
    <TransferContext.Provider
      value={{
        ...contextProps,
        feeSelected: contextProps.fee
          ? typeof contextProps.fee === 'number'
            ? contextProps.fee
            : Number(contextProps.fee[feeSpeedSelected]?.amount)
          : null,
      }}
    >
      {children}
    </TransferContext.Provider>
  )
}

export function useTransferContext() {
  const context = useContext(TransferContext)

  if (!context) {
    throw new Error(
      'You must wrap your component with TransferContextProvider to use useTransferContext'
    )
  }

  return context
}
