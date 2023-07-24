'use client'

import type { Account } from '@/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { Controller, useForm } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { FormControl, FormControlLabel, Radio, RadioGroup, useTheme } from '@mui/material'
import Stack from '@mui/material/Stack'
import pick from 'lodash/pick'
import { useSnackbar } from 'notistack'
import { checkIsValidAddress } from '@/utils'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { add, update } from '@/features/account/slice'
import useMediaQuery from '@mui/material/useMediaQuery'
import AssetSelect from '@/components/common/AssetSelect'
import DialogHeader from '@/components/common/DialogHeader'
import LoadFailed from '@soothe/ui/src/components/LoadFailed'
import { SupportedChains } from '@/constants/supportedChains'
import CircularLoading from '@soothe/ui/src/components/CircularLoading'
import { get } from 'lodash'

const defaultEmptyAccount: Omit<Account, '_id'> = {
  address: '',
  name: '',
  description: '',
  chain: SupportedChains.pocket,
}

interface CreateUpdateDialogProps {
  open: boolean
  onClose: () => void
  accountToEdit?: Account
}

type TWalletType = 'existing_wallet' | 'new_wallet'

const CreateUpdateDialog = ({ open, onClose, accountToEdit }: CreateUpdateDialogProps) => {
  const { status: connectionStatus, permissions } = useAppSelector((state) => state.connection)
  const { register, handleSubmit, formState, reset, control } = useForm<Account>({
    defaultValues: {
      ...defaultEmptyAccount,
      ...accountToEdit,
    },
  })
  const [walletType, setWalletType] = useState<TWalletType>('existing_wallet')

  const { isDirty } = formState

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [view, setView] = useState('form')
  const [addressInUse, setAddressInUse] = useState(false)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (!open) {
      timeout = setTimeout(() => {
        reset({ ...defaultEmptyAccount })
        setError(false)
        setIsLoading(false)
        setAddressInUse(false)
      }, 150)
    } else {
      reset({ ...defaultEmptyAccount, ...accountToEdit })
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line
  }, [open])

  const onChangeTypeOfWallet = useCallback((_: never, newValue: TWalletType) => {
    setWalletType(newValue)
  }, [])

  const onSubmit = useCallback(
    (data: Account) => {
      setIsLoading(true)
      let promise: Promise<{ error?: unknown } | object>
      if (accountToEdit) {
        promise = dispatch(
          update({
            _id: accountToEdit._id,
            data: pick(data, ['address', 'chain', 'description', 'name']),
          })
        )
      } else {
        promise = dispatch(add(data))
      }
      promise
        .then((response) => {
          if ('error' in response) {
            if (get(response, ['payload', 'addressInUse'])) {
              setAddressInUse(true)
            } else {
              setError(true)
            }
          } else {
            enqueueSnackbar(
              `Successfully ${accountToEdit ? 'updated' : 'added'} "${data.name}" account.`,
              {
                variant: 'success',
                autoHideDuration: 4000,
              }
            )
            onClose()
          }
        })
        .finally(() => setIsLoading(false))
    },
    [dispatch, onClose, accountToEdit, enqueueSnackbar, walletType]
  )

  const disableApply = useMemo(() => {
    if (accountToEdit) {
      return !isDirty
    }

    return false
  }, [accountToEdit, isDirty])

  const onClickError = useCallback(() => {
    setError(false)
    handleSubmit(onSubmit)()
  }, [handleSubmit, onSubmit])

  const content = useMemo(() => {
    if (isLoading) {
      return <CircularLoading />
    }

    if (error) {
      return (
        <LoadFailed
          onReloadClick={onClickError}
          loadText={'Operation Failed'}
          reloadText={'Please try again'}
          sxLoadText={{ width: 170 }}
        />
      )
    }

    if (addressInUse) {
      return (
        <LoadFailed
          onReloadClick={() => setAddressInUse(false)}
          loadText={'Another account or contact already have this Address with the same Asset.'}
          reloadText={'Please use another address or asset'}
          sxLoadText={{ width: 270, fontSize: 16, height: 'auto', textAlign: 'center' }}
          sxReloadText={{ width: 'max-content', fontSize: '12px', fontWeight: 400 }}
          sxContainerProps={{ width: 1 }}
        />
      )
    }

    const { errors } = formState

    return (
      <Stack spacing={'23px'}>
        <Controller
          name={'chain'}
          control={control}
          render={({ field }) => <AssetSelect {...field} />}
        />
        <FormControl sx={{ marginTop: '5px!important' }}>
          <RadioGroup row value={walletType} onChange={undefined}>
            <FormControlLabel
              value={'existing_wallet'}
              control={<Radio />}
              label={'Existing Wallet'}
            />
            <FormControlLabel value={'new_wallet'} control={<Radio />} label={'New Wallet'} />
          </RadioGroup>
        </FormControl>
        {walletType === 'existing_wallet' && (
          <TextField
            autoFocus
            size={'small'}
            label={'Address'}
            autoComplete={'off'}
            sx={{ marginTop: '8px!important' }}
            {...register('address', {
              required: 'Required',
              validate: (value, { chain }) => {
                const valid = checkIsValidAddress(value, chain)

                if (valid) return true

                return 'Invalid address'
              },
            })}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        )}
        <TextField
          label={'Name'}
          size={'small'}
          autoComplete={'off'}
          {...register('name', {
            required: 'Required',
            minLength: {
              value: 5,
              message: 'Should have at least 5 characters',
            },
          })}
          sx={{ marginTop: walletType === 'new_wallet' ? '8px!important' : undefined }}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          multiline={true}
          rows={4}
          size={'small'}
          label={'Description'}
          autoComplete={'off'}
          {...register('description')}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
      </Stack>
    )
  }, [
    register,
    formState,
    control,
    isLoading,
    error,
    onClickError,
    addressInUse,
    walletType,
    onChangeTypeOfWallet,
  ])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isXs}
      fullWidth={true}
      PaperProps={{
        sx: {
          maxWidth: { sm: 400 },
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader onClose={onClose}>Add Account</DialogHeader>

        <DialogContent
          sx={{
            padding: '20px!important',
            height: { xs: 'calc(100vh - 120px)', sm: 355 },
            boxSizing: 'border-box',
          }}
        >
          {content}
        </DialogContent>

        <DialogActions>
          <Button
            type={'submit'}
            disabled={disableApply || isLoading || error}
            variant={'outlined'}
          >
            {walletType === 'new_wallet' ? 'Next' : 'Save'}
          </Button>
          <Button onClick={onClose} variant={'outlined-cancel'}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateUpdateDialog
