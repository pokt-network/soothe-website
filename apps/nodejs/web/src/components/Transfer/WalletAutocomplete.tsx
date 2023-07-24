import React, { useCallback, useMemo } from 'react'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { FilterOptionsState } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AutocompleteRenderOptionState } from '@mui/material/Autocomplete/Autocomplete'
import { useTheme } from '@mui/material/styles'
import { Control } from 'react-hook-form/dist/types'
import { Controller } from 'react-hook-form'
import { RegisterOptions } from 'react-hook-form/dist/types/validator'

export interface Wallet {
  name: string
  address: string
  alias?: string
}

type CustomControl = Omit<Control, '_options' | 'register' | 'unregister'>

interface WalletAutocompleteProps
  extends Omit<AutocompleteProps<Wallet, false, false, false>, 'renderInput' | 'options'> {
  name: string
  control: CustomControl
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
  wallets: Wallet[]
  textFieldProps?: TextFieldProps
}

const WalletAutocomplete: React.FC<WalletAutocompleteProps> = ({
  control,
  name,
  wallets,
  rules,
  textFieldProps,
  ...autocompleteProps
}) => {
  const theme = useTheme()

  const walletsMap = useMemo(() => {
    return wallets.reduce((acc, wallet) => ({ ...acc, [wallet.address]: wallet }), {})
  }, [wallets])

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      control={control}
      rules={{
        required: 'Required',
        ...rules,
      }}
      render={({ field: { onChange, value, ...otherProps }, fieldState: { error } }) => (
        <Autocomplete
          options={wallets}
          filterOptions={filterOptions}
          disableClearable={true}
          renderOption={renderOption}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          onChange={(_, wallet: Wallet) => onChange(wallet.address)}
          value={walletsMap[value] || null}
          {...otherProps}
          renderInput={(params) => (
            <TextField
              {...params}
              error={!!error}
              helperText={error?.message}
              {...textFieldProps}
            />
          )}
          {...autocompleteProps}
        />
      )}
    />
  )
}

export default WalletAutocomplete
