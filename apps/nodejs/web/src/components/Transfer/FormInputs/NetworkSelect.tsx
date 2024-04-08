import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import React from 'react'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Controller, useFormContext } from 'react-hook-form'
import { NetworksByChains, SupportedChains } from '@/constants/supportedChains'

export default function NetworkSelect() {
  const { control, watch } = useFormContext<TransferFormValues>()

  const [selectedChain] = watch(['chain']) as [SupportedChains]

  const networkByChains = selectedChain ? NetworksByChains[selectedChain] || [] : []

  return (
    <Controller
      name={'network'}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          select
          fullWidth
          size={'small'}
          label={'Network'}
          disabled={!selectedChain}
          SelectProps={{
            IconComponent: networkByChains.length === 1 ? null : undefined,
          }}
          {...field}
          error={!!error}
          helperText={
            error?.message || networkByChains.length === 1
              ? `Can only send through ${networkByChains[0].label} network.`
              : ''
          }
          InputLabelProps={{
            shrink: !!field.value,
          }}
          InputProps={{ readOnly: networkByChains.length === 1 }}
        >
          {networkByChains.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  )
}
