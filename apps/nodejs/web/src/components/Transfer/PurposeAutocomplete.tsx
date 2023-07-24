import type { FilterOptionsState } from '@mui/material'
import type { Control } from 'react-hook-form/dist/types'
import type { RegisterOptions } from 'react-hook-form/dist/types/validator'
import type { LabelAndValue } from '@/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { Controller, useWatch } from 'react-hook-form'

type CustomControl = Omit<Control, '_options' | 'register' | 'unregister'>

interface PurposeAutocompleteProps
  extends Omit<AutocompleteProps<LabelAndValue, false, false, false>, 'renderInput' | 'options'> {
  name: string
  control: CustomControl
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
  purposes: readonly LabelAndValue[]
  textFieldProps?: TextFieldProps
}

interface PurposeItem extends LabelAndValue {
  inputValue?: string
  isNew?: boolean
}

const PurposeAutocomplete: React.FC<PurposeAutocompleteProps> = ({
  purposes,
  name,
  rules,
  control,
  textFieldProps,
}) => {
  const [value, setValue] = useState<PurposeItem>(null)

  const purposesMap = useMemo(() => {
    return purposes.reduce((acc, purpose) => ({ ...acc, [purpose.value]: purpose }), {})
  }, [purposes])

  const options: PurposeItem[] = useMemo(() => {
    if (!value || purposesMap[value?.value]) {
      return purposes as PurposeItem[]
    }

    return [value, ...purposes]
  }, [purposes, purposesMap, value])

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const valueOnForm = useWatch({ control, name }) as unknown as string

  useEffect(() => {
    if (purposesMap[valueOnForm]) {
      setValue(purposesMap[valueOnForm])
    } else {
      setValue({
        label: valueOnForm,
        value: valueOnForm,
        isNew: true,
      })
    }
  }, [valueOnForm])

  const filterOptions = useCallback(
    (options: PurposeItem[], state: FilterOptionsState<PurposeItem>) => {
      const value = state.inputValue.toLowerCase().trim()

      if (!value) return options

      const isExisting = options.some((option) => option.label === state.inputValue)

      if (!isExisting) {
        options.push({
          label: `Add "${state.inputValue}"`,
          inputValue: state.inputValue,
          value: state.inputValue,
          isNew: true,
        })
      }

      return options.filter(({ label, value, isNew }) => {
        return !!(label.toLowerCase().includes(value) || isNew)
      })
    },
    []
  )

  const getOptionLabel = useCallback((option: LabelAndValue) => {
    if (typeof option === 'string') {
      return option
    }

    return option.label
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
      render={({ field: { onChange, ...otherProps }, fieldState: { error } }) => {
        return (
          <Autocomplete
            options={options}
            filterOptions={filterOptions}
            disableClearable={true}
            selectOnFocus={true}
            clearOnBlur={true}
            getOptionLabel={getOptionLabel}
            // isOptionEqualToValue={isOptionEqualToValue}
            onChange={(event, newValue: PurposeItem) => {
              if (typeof newValue === 'string') {
                onChange(newValue)
              } else if (newValue && newValue.inputValue) {
                onChange(newValue.inputValue)
              } else {
                onChange(newValue.value)
              }
            }}
            // onChange={(_, purpose: LabelAndValue) => onChange(purpose.value)}
            {...otherProps}
            value={value}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!error}
                helperText={error?.message}
                {...textFieldProps}
              />
            )}
          />
        )
      }}
    />
  )
}

export default PurposeAutocomplete
