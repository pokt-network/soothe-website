import type { Account } from '@/types'
import React, { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import AccountAutocomplete from '@/components/Transfer/FormInputs/AccountAutocomplete'
import { TransferFormValues } from '@/components/Transfer/TransferForm'
import { useAppSelector } from '@/hooks/redux'

export default function FromAutocomplete() {
  const { accountsByChain } = useAppSelector((state) => state.account)
  const { watch } = useFormContext<TransferFormValues>()
  const [selectedChain, fromAccountPassed] = watch(['chain', 'from_account_passed'])

  const accounts: Account[] = useMemo(() => {
    if (selectedChain) {
      return accountsByChain[selectedChain]
    }

    return []
  }, [accountsByChain, selectedChain])
  return (
    <AccountAutocomplete
      accounts={accounts}
      textFieldProps={{
        label: 'Transfer From',
        disabled: !selectedChain,
        InputProps: {
          readOnly: fromAccountPassed,
          endAdornment: fromAccountPassed ? null : undefined,
        },
      }}
      autocompleteProps={{
        disabled: !selectedChain,
        readOnly: fromAccountPassed,
      }}
      name={'transfer_from'}
    />
  )
}
