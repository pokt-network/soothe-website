import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import React, { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import CommonAssetSelect from '@/components/common/AssetSelect'
import { SupportedChains } from '@/constants/supportedChains'
import { useAppSelector } from '@/hooks/redux'

export default function AssetSelect() {
  const { control, watch } = useFormContext<TransferFormValues>()
  const accountsByChain = useAppSelector((state) => state.account.accountsByChain)

  const fromAccountPassed = watch('from_account_passed')

  const chains = useMemo(() => {
    if (!accountsByChain) return []

    return Object.keys(accountsByChain) as SupportedChains[]
  }, [accountsByChain])

  return (
    <Controller
      control={control}
      name={'chain'}
      render={({ field, fieldState: { error } }) => (
        <CommonAssetSelect
          chains={chains}
          {...field}
          error={!!error}
          helperText={error?.message}
          InputProps={{ readOnly: fromAccountPassed }}
          SelectProps={{
            IconComponent: fromAccountPassed ? null : undefined,
          }}
        />
      )}
    />
  )
}
