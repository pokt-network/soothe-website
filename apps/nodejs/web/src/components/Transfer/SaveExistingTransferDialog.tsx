import Grid from '@mui/material/Grid'
import { useSnackbar } from 'notistack'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import LoadFailed from '@soothe/ui/src/components/LoadFailed'
import CircularLoading from '@soothe/ui/src/components/CircularLoading'
import PurposeAutocomplete from '@/components/Transfer/PurposeAutocomplete'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import DialogHeader from '@/components/common/DialogHeader'
import { add } from '@/features/purpose/slice'
import { OfflineTransferDs } from '@/datasource/transfer'

interface SaveExistingTransferDialogProps {
  open: boolean
  onClose: () => void
  onTransferSaved?: () => void
  hash: string
  id?: string
  defaultPurpose?: string
  defaultInternalMemo?: string
}

interface FormValues {
  purpose: string
  internal_memo: string
  adding_new_purpose: boolean
  new_purpose_name?: string
}

export default function SaveExistingTransferDialog({
  id,
  hash,
  defaultInternalMemo,
  defaultPurpose,
  open,
  onClose,
  onTransferSaved,
}: SaveExistingTransferDialogProps) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const purposes = useAppSelector((state) => state.purpose.purposes)
  const workspaceKey = useAppSelector((state) => state.workspace.key)
  const workspace = useAppSelector((state) => state.workspace.workspace)

  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const methods = useForm<FormValues>({
    defaultValues: {
      purpose: defaultPurpose || purposes?.[0]?._id || '',
      internal_memo: defaultInternalMemo || '',
      adding_new_purpose: false,
      new_purpose_name: '',
    },
  })

  const { setValue, control, reset, handleSubmit, getValues } = methods

  const [status, setStatus] = useState<'loading' | 'form' | 'error'>('form')

  useEffect(() => {
    const timeout = setTimeout(
      () =>
        reset({
          purpose: defaultPurpose || purposes?.[0]?._id || '',
          internal_memo: defaultInternalMemo || '',
          adding_new_purpose: false,
          new_purpose_name: '',
        }),
      200
    )

    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultInternalMemo, defaultPurpose, hash])

  useEffect(() => {
    const purpose = getValues('purpose')

    if (!purpose && purposes.length) {
      setValue('purpose', purposes[0]._id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purposes])

  const onSubmit = async (data: FormValues) => {
    try {
      setStatus('loading')
      const { adding_new_purpose, new_purpose_name, purpose, internal_memo } = data

      let purposeId = purpose

      if (adding_new_purpose && new_purpose_name) {
        const newPurpose = await dispatch(add({ name: new_purpose_name })).unwrap()
        purposeId = newPurpose._id
      }

      // todo: add support for backend datasource
      const offlineTransferDs = new OfflineTransferDs(workspace._id, workspaceKey)

      if (id) {
        await offlineTransferDs.update(id, {
          internal_memo,
          hash,
          purpose: purposeId,
        })
      } else {
        await offlineTransferDs.add({
          internal_memo: internal_memo.trim(),
          hash,
          purpose: purposeId,
        })
      }

      if (onTransferSaved) {
        onTransferSaved()
      }

      enqueueSnackbar(`Successfully ${id ? 'updated' : 'saved'} transfer data.`, {
        variant: 'success',
        autoHideDuration: 4000,
      })

      onClose()
      setStatus('form')
    } catch (e) {
      setStatus('error')
    }
  }

  let content: JSX.Element

  if (status === 'loading') {
    content = <CircularLoading />
  } else if (status === 'error') {
    content = (
      <LoadFailed
        onReloadClick={() => handleSubmit(onSubmit)()}
        loadText={'Operation Failed'}
        reloadText={'Please try again'}
        sxLoadText={{ width: 170 }}
      />
    )
  } else {
    content = (
      <FormProvider {...methods}>
        <Grid container spacing={'30px'}>
          <Grid item xs={12}>
            <PurposeAutocomplete />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name={'internal_memo'}
              render={({ field }) => (
                <TextField
                  multiline
                  rows={5}
                  size={'small'}
                  label={'Memo for internal record keeping'}
                  fullWidth
                  {...field}
                  InputLabelProps={{
                    shrink: !!field.value,
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormProvider>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth={'xs'} fullWidth={true} fullScreen={isXs}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader onClose={onClose}>
          <Typography variant={'h6'} color={theme.customColors.white} fontWeight={700}>
            {id ? 'Update' : 'Save'} Transfer Data
          </Typography>
        </DialogHeader>
        <DialogContent
          sx={{
            padding: '20px!important',
            height: { xs: 'calc(100vh - 120px)', sm: 250 },
            boxSizing: 'border-box',
          }}
        >
          {content}
        </DialogContent>
        <DialogActions>
          <Button type={'submit'} variant={'outlined'}>
            Submit
          </Button>
          <Button onClick={onClose} variant={'outlined-cancel'}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
