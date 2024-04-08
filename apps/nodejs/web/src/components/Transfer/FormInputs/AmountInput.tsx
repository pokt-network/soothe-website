import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import React from 'react'
import TextField from '@mui/material/TextField'
import { Controller, useFormContext } from 'react-hook-form'
import { SupportedChains } from '@/constants/supportedChains'
import { useTransferContext } from '@/context/TransferContext'
import AmountHelperText from '@/components/Transfer/AmountHelperText'

export default function AmountInput() {
  const { balanceFetchStatus, fromAvailableBalance, feeSelected } = useTransferContext()
  const { control, watch } = useFormContext<TransferFormValues>()
  const [selectedChain, transferFrom] = watch(['chain', 'transfer_from'])

  return (
    <Controller
      name={'transfer_amount'}
      control={control}
      rules={{
        required: 'Required',
        max: {
          value: Math.max(0, (fromAvailableBalance || 0) - feeSelected),
          message: 'Higher than account balance',
        },
        // todo: handle the min
        min: selectedChain === SupportedChains.pocket ? 1 / 1e6 : 1 / 1e18,
      }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          label={'Transfer amount'}
          size={'small'}
          type={'number'}
          disabled={!transferFrom || balanceFetchStatus !== 'fetched' || !feeSelected}
          fullWidth
          sx={{
            '& .MuiFormHelperText-root': {
              left: 10,
              bottom: -32,
              width: 'calc(100% - 20px)',
            },
          }}
          InputLabelProps={{
            shrink: !!field.value,
          }}
          error={!!error}
          helperText={<AmountHelperText />}
          {...field}
        />
      )}
    />
  )
}
