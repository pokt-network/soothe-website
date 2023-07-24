import type { Control } from 'react-hook-form/dist/types'
import type { UseFormSetValue } from 'react-hook-form/dist/types/form'
import type { SupportedChains } from '@/constants/supportedChains'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import WalletAutocomplete, { Wallet } from '@/components/Transfer/WalletAutocomplete'
import { Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import { checkIsValidAddress } from '@/utils'
import { UseFormClearErrors } from 'react-hook-form/dist/types/form'

interface TransferToProps {
  control: Control<any>
  setValue: UseFormSetValue<any>
  wallets: Wallet[]
  chain: SupportedChains
  disabled?: boolean
  clearErrors: UseFormClearErrors<any>
}

const TransferTo: React.FC<TransferToProps> = ({
  control,
  clearErrors,
  setValue,
  wallets,
  disabled,
  chain,
}) => {
  const theme = useTheme()
  const [addingNew, setAddingNew] = useState(false)

  const toggleAddingNew = useCallback(() => {
    setAddingNew((prevState) => !prevState)
  }, [])

  useEffect(() => {
    if (addingNew) {
      setValue('transfer_to', '')
      clearErrors('transfer_to')
    } else {
      setValue('new_contact_name', '')
      setValue('new_contact_address', '')
      clearErrors('new_contact_name')
      clearErrors('new_contact_address')
    }
  }, [addingNew])

  const actionComponent = useMemo(() => {
    const text = addingNew ? 'Cancel' : 'New contact'
    const color = addingNew ? theme.customColors.dark75 : theme.customColors.primary500
    return (
      <Typography
        variant={'body2'}
        color={color}
        sx={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}
        position={'relative'}
        zIndex={10}
        onClick={toggleAddingNew}
      >
        {text}
      </Typography>
    )
  }, [addingNew, theme, toggleAddingNew])

  const inputComponent = useMemo(() => {
    if (addingNew) {
      return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <Controller
            control={control}
            name={'new_contact_name'}
            rules={{
              required: 'Required',
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                label={'Contact name'}
                error={!!error}
                helperText={error?.message}
                {...field}
                disabled={disabled}
                sx={{
                  width: { xs: 1, md: 175 },
                }}
              />
            )}
          />
          <Controller
            name={'new_contact_address'}
            control={control}
            rules={{
              required: 'Required',
              validate: (value) => {
                if (!addingNew) return true

                if (!chain) return 'Select asset'

                const valid = checkIsValidAddress(value, chain)

                if (valid) return true

                return 'Invalid address'
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                label={'Address'}
                error={!!error}
                helperText={error?.message}
                {...field}
                disabled={disabled}
                sx={{
                  width: { xs: 1, md: 'unset' },
                  flexGrow: { md: 1 },
                }}
              />
            )}
          />
        </Stack>
      )
    } else {
      return (
        <WalletAutocomplete
          name={'transfer_to'}
          control={control}
          wallets={wallets}
          rules={{ required: 'Required' }}
          textFieldProps={{
            label: 'Transfer From',
            disabled,
          }}
          disabled={disabled}
        />
      )
    }
  }, [addingNew, control, wallets, disabled, chain])

  return (
    <Stack spacing={0.5} marginBottom={-1.5} position={'relative'}>
      {inputComponent}
      <Stack direction={'row'} justifyContent={'flex-end'}>
        {actionComponent}
      </Stack>
    </Stack>
  )
}

export default TransferTo
