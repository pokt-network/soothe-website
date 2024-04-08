import type { Contact } from '@/types'
import { useTheme } from '@mui/material/styles'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { Controller, useFormContext } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import { checkIsValidAddress } from '@/utils'
import { TransferFormValues } from '@/components/Transfer/TransferForm'
import AccountAutocomplete from '@/components/Transfer/FormInputs/AccountAutocomplete'
import { SupportedChains } from '@/constants/supportedChains'
import { useAppSelector } from '@/hooks/redux'

export default function RecipientSelect() {
  const theme = useTheme()
  const { accountsByChain } = useAppSelector((state) => state.account)
  const contacts = useAppSelector((state) => state.contact.contacts) as Contact[]
  const { control, setValue, clearErrors, watch } = useFormContext<TransferFormValues>()
  const [selectedChain, transferFrom, newContactAddress] = watch([
    'chain',
    'transfer_from',
    'new_contact_address',
  ]) as [SupportedChains, string, string]

  const [addingNew, setAddingNew] = useState(!!newContactAddress)

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

  const recipients = useMemo(() => {
    if (!selectedChain) return []

    const wallets = []

    for (const contact of contacts) {
      for (const wallet of contact.wallets) {
        if (wallet.chain === selectedChain) {
          wallets.push({
            id: contact._id + wallet.address,
            name: contact.display_name,
            address: wallet.address,
            alias: wallet.alias,
          })
        }
      }
    }

    const accounts = selectedChain ? accountsByChain[selectedChain] : []

    for (const acc of accounts) {
      if (acc.address === transferFrom) continue

      wallets.push({
        id: acc._id + acc.address,
        name: acc.name,
        address: acc.address,
      })
    }

    return wallets
  }, [contacts, accountsByChain, selectedChain, transferFrom])

  let inputComponent: React.ReactNode

  if (addingNew) {
    inputComponent = (
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
              disabled={!selectedChain || !transferFrom}
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

              if (!selectedChain) return 'Select asset'

              const valid = checkIsValidAddress(value, selectedChain)

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
              disabled={!selectedChain || !transferFrom}
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
    inputComponent = (
      <AccountAutocomplete
        name={'transfer_to'}
        accounts={recipients}
        textFieldProps={{
          label: 'Transfer To',
          disabled: !selectedChain || !transferFrom,
        }}
        autocompleteProps={{
          disabled: !selectedChain || !transferFrom,
        }}
      />
    )
  }

  return (
    <Stack spacing={0.5} marginBottom={-1.5} position={'relative'}>
      {inputComponent}
      <Stack direction={'row'} justifyContent={'flex-end'}>
        <Typography
          variant={'body2'}
          color={addingNew ? theme.customColors.dark75 : theme.customColors.primary500}
          sx={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}
          position={'relative'}
          zIndex={10}
          onClick={toggleAddingNew}
        >
          {addingNew ? 'Cancel' : 'New contact'}
        </Typography>
      </Stack>
    </Stack>
  )
}
