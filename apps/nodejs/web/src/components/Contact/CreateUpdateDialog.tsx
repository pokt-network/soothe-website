import type { Contact, Wallet } from '@/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import DialogHeader from '@/components/common/DialogHeader'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import useMediaQuery from '@mui/material/useMediaQuery'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import pick from 'lodash/pick'
import LoadFailed from '@soothe/ui/src/components/LoadFailed'
import DeleteIcon from '@soothe/ui/src/assets/icons/delete.svg'
import CircularLoading from '@soothe/ui/src/components/CircularLoading'
import CircularAddIcon from '@soothe/ui/src/assets/icons/add_circular.svg'
import { ContactType } from '@/constants'
import { checkIsValidAddress } from '@/utils'
import { useAppDispatch } from '@/hooks/redux'
import { add, update } from '@/features/contact/slice'
import AssetSelect from '@/components/common/AssetSelect'
import { labelByChainMap, SupportedChains } from '@/constants/supportedChains'
import { useSnackbar } from 'notistack'
import { get } from 'lodash'

interface CustomWallet extends Omit<Wallet, 'chain'> {
  chain: SupportedChains | ''
}

interface FormValuesType extends Omit<Contact, '_id' | 'wallets'> {
  wallets: CustomWallet[]
}

interface CreateUpdateDialogProps {
  open: boolean
  onClose: () => void
  contactToUpdate?: Contact
}

const emptyContact: FormValuesType = {
  first_name: '',
  company_name: '',
  display_name: '',
  type: ContactType.personal,
  last_name: '',
  email: '',
  phone_number: '',
  wallets: [
    {
      address: '',
      description: '',
      alias: '',
      chain: '',
    },
  ],
}

//todo: Update labels when updating and disable button

const CreateUpdateDialog = ({ open, onClose, contactToUpdate }: CreateUpdateDialogProps) => {
  const { handleSubmit, control, register, reset, formState, getValues, setValue } =
    useForm<FormValuesType>({
      defaultValues: {
        ...emptyContact,
        ...contactToUpdate,
      },
    })

  const { isDirty } = formState
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'wallets',
    rules: {
      minLength: {
        value: 1,
        message: 'Should have at least 1 wallet.',
      },
      validate: (value) => {
        const chainByAddressMap = {}

        for (const { address, chain } of value) {
          if (address && chain) {
            if (chainByAddressMap[address] === chain) {
              return `The address "${address}" with the asset "${labelByChainMap[chain]}" is being used several times.`
            } else {
              chainByAddressMap[address] = chain
            }
          }
        }

        return true
      },
      required: 'Required.',
    },
  })

  const walletsError = formState?.errors?.wallets?.root?.message

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const { enqueueSnackbar } = useSnackbar()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [walletInUse, setWalletInUse] = useState<{ address: string; chain: SupportedChains }>(null)
  const dispatch = useAppDispatch()

  const onSubmit = useCallback(
    (data: Omit<Contact, '_id'>) => {
      setIsLoading(true)
      let promise: Promise<object>
      if (contactToUpdate) {
        promise = dispatch(
          update({
            _id: contactToUpdate._id,
            data: pick(data, [
              'first_name',
              'last_name',
              'company_name',
              'display_name',
              'email',
              'phone_number',
              'type',
              'wallets',
            ]),
          })
        )
      } else {
        promise = dispatch(add(data))
      }
      promise
        .then((response) => {
          if ('error' in response) {
            if (get(response, ['payload', 'addressInUse'])) {
              setWalletInUse({
                address: get(response, ['payload', 'addressInUse']),
                chain: get(response, ['payload', 'chainOfAddressInUse']),
              })
            } else {
              setError(true)
            }
          } else {
            enqueueSnackbar(
              `Successfully ${contactToUpdate ? 'updated' : 'added'} "${
                data.display_name
              }" contact.`,
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
    [onClose, contactToUpdate, dispatch, enqueueSnackbar]
  )

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (!open) {
      timeout = setTimeout(() => {
        reset({
          ...emptyContact,
        })
        setError(false)
        setIsLoading(false)
      }, 150)
    } else {
      reset({ ...emptyContact, ...contactToUpdate })
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line
  }, [open])

  const onBlurFirstName = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const firstNameValue = event.target.value

      if (firstNameValue) {
        const displayNameValue = getValues('display_name')

        if (!displayNameValue) {
          setValue('display_name', firstNameValue)
        } else {
          const lastNameValue = getValues('last_name')

          if (displayNameValue === lastNameValue) {
            setValue('display_name', `${firstNameValue} ${lastNameValue}`)
          }
        }
      }
    },
    [getValues, setValue]
  )

  const onBlurLastName = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const lastNameValue = event.target.value

      if (lastNameValue) {
        const displayNameValue = getValues('display_name')

        if (!displayNameValue) {
          setValue('display_name', lastNameValue)
        } else {
          const firstNameValue = getValues('first_name')

          if (displayNameValue === firstNameValue) {
            setValue('display_name', `${firstNameValue} ${lastNameValue}`)
          }
        }
      }
    },
    [getValues, setValue]
  )

  const onBlurCompanyName = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const companyNameValue = event.target.value

      if (companyNameValue) {
        const displayNameValue = getValues('display_name')

        if (!displayNameValue) {
          setValue('display_name', companyNameValue)
        }
      }
    },
    [getValues, setValue]
  )

  const onClickAddWallet = useCallback(() => {
    append({
      address: '',
      description: '',
      alias: '',
      chain: '',
    })
  }, [append])

  const onClickError = useCallback(() => {
    setError(false)
    handleSubmit(onSubmit)()
  }, [handleSubmit, onSubmit])

  const disableApply = useMemo(() => {
    if (contactToUpdate) {
      return !isDirty
    }

    return false
  }, [contactToUpdate, isDirty])

  const content = useMemo(() => {
    if (isLoading) {
      return <CircularLoading />
    }

    if (error) {
      return <LoadFailed onReloadClick={onClickError} />
    }

    if (walletInUse) {
      return (
        <LoadFailed
          onReloadClick={() => setWalletInUse(null)}
          loadText={`Another account or contact already have the address "${
            walletInUse.address
          }" with the same asset ${labelByChainMap[walletInUse.chain]}.`}
          reloadText={'Please use another address or asset'}
          sxLoadText={{
            width: { xs: 300, sm: 380 },
            fontSize: { xs: 12, sm: 14 },
            height: 'auto',
            textAlign: 'center',
          }}
          sxReloadText={{ width: 'max-content', fontSize: '12px', fontWeight: 400 }}
          sxContainerProps={{ width: 1 }}
        />
      )
    }

    const { errors } = formState

    return (
      <>
        <Grid container rowSpacing={2.3} columnSpacing={'15px'}>
          <Grid item xs={12} sm={6} xl={3}>
            <TextField
              autoFocus
              fullWidth
              size={'small'}
              label={'First Name'}
              {...register('first_name')}
              onBlur={onBlurFirstName}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <TextField
              fullWidth
              label={'Last Name'}
              size={'small'}
              {...register('last_name')}
              onBlur={onBlurLastName}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <TextField
              fullWidth
              size={'small'}
              label={'Company Name'}
              {...register('company_name')}
              onBlur={onBlurCompanyName}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <Controller
              render={({ field, fieldState }) => (
                <TextField
                  fullWidth
                  size={'small'}
                  label={'Display Name As *'}
                  {...field}
                  InputLabelProps={{
                    shrink: !!field.value,
                  }}
                  error={!!fieldState?.error}
                  helperText={fieldState?.error?.message}
                />
              )}
              rules={{
                required: 'Required',
              }}
              name={'display_name'}
              control={control}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={'Email'}
              size={'small'}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', { required: 'Required' })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size={'small'}
              label={'Mobile Number'}
              {...register('phone_number')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name={'type'}
              control={control}
              render={({ field }) => (
                <TextField select fullWidth label={'Type'} {...field} size={'small'}>
                  <MenuItem value={'personal'}>Personal</MenuItem>
                  <MenuItem value={'business'}>Business</MenuItem>
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        <Divider
          sx={{ marginTop: '20px', marginBottom: '15px', borderColor: theme.customColors.dark25 }}
        />

        <Stack
          direction={'row'}
          alignItems={'center'}
          marginBottom={'10px'}
          justifyContent={'space-between'}
          flexGrow={1}
        >
          <Typography fontWeight={600} letterSpacing={'0.5px'}>
            Wallets
          </Typography>

          <Button onClick={onClickAddWallet}>
            <CircularAddIcon style={{ marginRight: '5px' }} /> Add
          </Button>
        </Stack>

        <Stack
          spacing={'5px'}
          border={`1px solid ${theme.customColors.dark50}`}
          bgcolor={theme.customColors.white}
          height={{ sm: 173, xl: 233 }}
          overflow={'auto'}
          paddingX={1}
        >
          {fields.map(({ id }, index) => {
            return (
              <Stack
                key={id}
                spacing={'10px'}
                borderBottom={
                  index + 1 === fields.length ? undefined : `1px solid ${theme.customColors.dark25}`
                }
                paddingY={'10px'}
                direction={'row'}
              >
                <Stack flexGrow={1} spacing={'15px'}>
                  <TextField
                    fullWidth={true}
                    placeholder={'Address'}
                    size={'small'}
                    error={!!errors.wallets?.[index]}
                    helperText={errors.wallets?.[index]?.address?.message}
                    {...register(`wallets.${index}.address`, {
                      required: 'Required',
                      deps: `wallets.${index}.chain`,
                      validate: (value: string, formValues) => {
                        const chain = formValues.wallets.find(
                          (item) => item.address === value
                        ).chain
                        if (chain === '') {
                          return 'You must select the Asset.'
                        }

                        if (!checkIsValidAddress(value, chain)) {
                          return `Invalid Address`
                        }

                        return true
                      },
                    })}
                  />
                  <Stack direction={'row'} spacing={'10px'}>
                    <Controller
                      name={`wallets.${index}.chain`}
                      control={control}
                      rules={{
                        required: true,
                        deps: `wallets.${index}.address`,
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <AssetSelect
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          label={field.value ? null : 'Asset'}
                          InputLabelProps={{
                            shrink: false,
                            sx: {
                              display: field.value ? 'none' : undefined,
                              color: theme.customColors.dark50,
                            },
                          }}
                        />
                      )}
                    />
                    <TextField
                      fullWidth={true}
                      placeholder={'Alias'}
                      size={'small'}
                      {...register(`wallets.${index}.alias`)}
                    />
                  </Stack>
                  <TextField
                    size={'small'}
                    placeholder={'Description'}
                    multiline
                    {...register(`wallets.${index}.description`)}
                  />
                </Stack>
                <IconButton
                  disabled={fields.length === 1}
                  sx={{
                    padding: '0px',
                    marginTop: '3px!important',
                    height: 30,
                    '&.Mui-disabled': {
                      '& path': {
                        fill: theme.customColors.dark25,
                      },
                    },
                  }}
                  onClick={() => remove(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            )
          })}
        </Stack>
        <Stack display={walletsError ? 'flex' : 'none'} mt={0.5}>
          <Typography variant={'body2'} color={theme.customColors.red}>
            {walletsError}
          </Typography>
        </Stack>
      </>
    )
  }, [
    walletInUse,
    isLoading,
    error,
    theme,
    fields,
    control,
    formState,
    onClickError,
    onClickAddWallet,
    onBlurFirstName,
    onBlurCompanyName,
    onBlurLastName,
    register,
    remove,
    walletsError,
  ])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      fullScreen={isXs}
      PaperProps={{
        sx: {
          maxWidth: { sm: 700 },
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader onClose={onClose}>
          {`${contactToUpdate ? 'Update' : 'Add'} Contact`}
        </DialogHeader>

        <DialogContent
          sx={{
            padding: '20px!important',
            height: {
              xs: 'calc(100vh - 135px)',
              sm: walletsError ? 555 : 515,
              md: walletsError ? 535 : 515,
            },
            boxSizing: 'border-box',
          }}
        >
          {content}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={disableApply || isLoading || error}
            type={'submit'}
            variant={'outlined'}
          >
            Save
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
