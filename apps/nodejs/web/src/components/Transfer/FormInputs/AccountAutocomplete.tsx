import type { FilterOptionsState } from '@mui/material'
import type { RegisterOptions } from 'react-hook-form/dist/types/validator'
import type { AutocompleteRenderOptionState } from '@mui/material/Autocomplete/Autocomplete'
import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import merge from 'lodash/merge'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useCallback, useMemo } from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { Controller, FieldPath, useFormContext } from 'react-hook-form'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'

export interface Wallet {
  name: string
  address: string
  alias?: string
}

interface AccountAutocompleteProps {
  accounts: Wallet[]
  name: FieldPath<TransferFormValues>
  textFieldProps?: TextFieldProps
  autocompleteProps?: Partial<AutocompleteProps<Wallet, any, any, any>>
  customRules?: Omit<
    RegisterOptions<TransferFormValues, FieldPath<TransferFormValues>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
}

export default function AccountAutocomplete({
  accounts,
  name,
  autocompleteProps,
  textFieldProps,
  customRules,
}: AccountAutocompleteProps) {
  const theme = useTheme()
  const { control } = useFormContext<TransferFormValues>()

  const accountsMap = useMemo(() => {
    return accounts.reduce((acc, wallet) => ({ ...acc, [wallet.address]: wallet }), {})
  }, [accounts])

  const filterOptions = useCallback((options: Wallet[], state: FilterOptionsState<Wallet>) => {
    const value = state.inputValue.toLowerCase().trim()

    if (!value) return options

    return options.filter(({ name, address, alias }) => {
      if (address.toLowerCase().includes(value)) {
        return true
      }

      if (name.toLowerCase().includes(value)) {
        return true
      }

      if (alias && alias.toLowerCase().includes(value)) {
        return true
      }

      return false
    })
  }, [])

  const renderOption = useCallback(
    (
      props: React.HTMLAttributes<unknown>,
      wallet: Wallet,
      state: AutocompleteRenderOptionState
    ) => {
      return (
        <Stack
          {...props}
          key={wallet.address}
          width={`calc(100% - 20px)`}
          spacing={0.5}
          marginX={1}
          paddingY={'8px!important'}
          paddingX={'5px!important'}
          boxSizing={'border-box'}
          alignItems={'flex-start!important'}
          borderTop={state.index === 0 ? undefined : `1px solid ${theme.customColors.dark25}`}
        >
          <Stack direction={'row'} alignItems={'center'}>
            <Typography>{wallet.name}</Typography>
            {wallet.alias && (
              <>
                <Typography
                  display={'inline'}
                  fontWeight={300}
                  color={theme.customColors.dark90}
                  variant={'body2'}
                  marginLeft={0.7}
                >
                  ({wallet.alias})
                </Typography>
              </>
            )}
          </Stack>

          <Typography variant={'body2'} color={theme.customColors.dark75}>
            {wallet.address}
          </Typography>
        </Stack>
      )
    },
    [theme]
  )

  const isOptionEqualToValue = useCallback((option: Wallet, value: Wallet) => {
    return option.address === value.address
  }, [])

  const getOptionLabel = useCallback((option: Wallet) => {
    return `${option.name} (${
      option.alias || '...' + option.address.substring(option.address.length - 10)
    })`
  }, [])

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: 'Required',
        ...customRules,
      }}
      render={({ field: { onChange, value, ...otherProps }, fieldState: { error } }) => (
        <Autocomplete
          options={accounts}
          filterOptions={filterOptions}
          disableClearable={true}
          renderOption={renderOption}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          onChange={(_, wallet: Wallet) => onChange(wallet.address)}
          value={accountsMap[value as string] || null}
          {...otherProps}
          renderInput={(params) => (
            <TextField
              error={!!error}
              helperText={error?.message}
              {...merge(params, textFieldProps)}
            />
          )}
          {...autocompleteProps}
        />
      )}
    />
  )
}
