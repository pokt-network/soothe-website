import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import React from 'react'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import { useFormContext } from 'react-hook-form'
import AssetSelect from './AssetSelect'
import AmountInput from '@/components/Transfer/FormInputs/AmountInput'
import NetworkSelect from '@/components/Transfer/FormInputs/NetworkSelect'
import PurposeAutocomplete from '@/components/Transfer/PurposeAutocomplete'
import RecipientSelect from '@/components/Transfer/FormInputs/RecipientSelect'
import FromAutocomplete from '@/components/Transfer/FormInputs/FromAutocomplete'
import BaseCustomDivider, { CustomDividerProps } from '@/components/Transfer/CustomDivider'

const CustomDivider: React.FC<CustomDividerProps> = (props) => {
  return <BaseCustomDivider sxDividerProps={{ marginTop: 2.5, mb: 2, marginX: -1 }} {...props} />
}

export default function FormInputs() {
  const { register } = useFormContext<TransferFormValues>()

  return (
    <Grid container columnSpacing={'20px'}>
      <Grid item xs={12} sm={6}>
        <AssetSelect />
      </Grid>
      <CustomDivider justXs />
      <Grid item xs={12} sm={6}>
        <NetworkSelect />
      </Grid>
      <CustomDivider />
      <Grid item xs={12} sm={6}>
        <FromAutocomplete />
      </Grid>
      <CustomDivider justXs />
      <Grid item xs={12} sm={6}>
        <RecipientSelect />
      </Grid>
      <CustomDivider />

      <Grid item xs={12} sm={6} paddingBottom={{ xs: 1, sm: 0.5 }} height={50}>
        <AmountInput />
      </Grid>
      <CustomDivider justXs />

      <Grid item xs={12} sm={6}>
        <PurposeAutocomplete />
      </Grid>
      <CustomDivider />

      <Grid item xs={12} sm={6}>
        <TextField
          multiline
          rows={5}
          fullWidth
          label={'Message to recipient'}
          size={'small'}
          {...register('recipient_message')}
        />
      </Grid>
      <CustomDivider justXs />

      <Grid item xs={12} sm={6}>
        <TextField
          multiline
          rows={5}
          size={'small'}
          label={'Memo for internal record keeping'}
          fullWidth
          {...register('internal_memo')}
        />
      </Grid>
    </Grid>
  )
}
