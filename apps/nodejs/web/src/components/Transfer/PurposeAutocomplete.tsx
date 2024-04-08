import type { FilterOptionsState, Theme } from '@mui/material'
import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import type { LabelAndValue } from '@/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { Controller, useFormContext } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import { useAppSelector } from '@/hooks/redux'

interface PurposeAutocompleteProps
  extends Omit<AutocompleteProps<LabelAndValue, false, false, false>, 'renderInput' | 'options'> {
  textFieldProps?: TextFieldProps
}

const PurposeAutocomplete: React.FC<PurposeAutocompleteProps> = ({
  textFieldProps,
  ...autocompleteProps
}) => {
  const { control } = useFormContext<TransferFormValues>()
  const purposes = useAppSelector((state) => state.purpose.purposes)

  const purposesMap = useMemo(() => {
    return purposes.reduce((acc, purpose) => ({ ...acc, [purpose._id]: purpose.name }), {})
  }, [purposes])

  const filterOptions = useCallback(
    (_, state: FilterOptionsState<string>) => {
      const value = state.inputValue.toLowerCase().trim()

      if (!value) return Object.keys(purposesMap)

      return purposes
        .filter(({ name }) => {
          return !!name.toLowerCase().includes(value)
        })
        .map(({ _id }) => _id)
    },
    [purposesMap, purposes]
  )

  const getOptionLabel = useCallback(
    (purposeId: string) => {
      return purposesMap[purposeId] || purposeId
    },
    [purposesMap]
  )

  return (
    <Controller
      name={'purpose'}
      control={control}
      rules={{
        required: 'Required',
      }}
      render={({ field: { onChange, ...otherProps }, fieldState: { error } }) => {
        return (
          <Autocomplete
            options={Object.keys(purposesMap)}
            filterOptions={filterOptions}
            disableClearable={true}
            selectOnFocus={true}
            clearOnBlur={true}
            getOptionLabel={getOptionLabel}
            onChange={(_, newValue: string) => {
              onChange(newValue)
            }}
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
        )
      }}
    />
  )
}

const NewPurposeInput = () => {
  const { control } = useFormContext<TransferFormValues>()
  return (
    <Controller
      control={control}
      name={'new_purpose_name'}
      rules={{
        required: 'Required',
        maxLength: {
          value: 25,
          message: 'The max amount of characters allowed is 25',
        },
        minLength: {
          value: 3,
          message: 'The min amount of characters allowed is 3',
        },
      }}
      render={({ field: { ref, ...field }, fieldState: { error } }) => (
        <TextField
          label={'Purpose Name'}
          {...field}
          inputRef={ref}
          error={!!error}
          helperText={error?.message}
          sx={{
            width: { xs: 1, md: 'unset' },
            flexGrow: { md: 1 },
          }}
        />
      )}
    />
  )
}

const PurposeInput = () => {
  const theme: Theme = useTheme()
  const { watch, setValue, clearErrors, setFocus } = useFormContext<TransferFormValues>()
  const [addingNew] = watch(['adding_new_purpose'])

  const toggleAddingNew = () => {
    setValue('adding_new_purpose', !addingNew)
  }

  useEffect(() => {
    setValue('new_purpose_name', '')
    clearErrors('new_purpose_name')
    if (addingNew) {
      setFocus('new_purpose_name')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addingNew])

  let input: React.ReactNode
  if (addingNew) {
    input = <NewPurposeInput />
  } else {
    input = <PurposeAutocomplete />
  }

  return (
    <Stack spacing={0.5} marginBottom={-1.5} position={'relative'}>
      {input}
      <Stack direction={'row'} alignItems={'center'} justifyContent={'flex-end'}>
        <Typography
          variant={'body2'}
          color={addingNew ? theme.customColors.dark75 : theme.customColors.primary500}
          sx={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}
          position={'relative'}
          zIndex={10}
          onClick={toggleAddingNew}
          textAlign={'right'}
        >
          {addingNew ? 'Cancel' : 'New purpose'}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default PurposeInput
