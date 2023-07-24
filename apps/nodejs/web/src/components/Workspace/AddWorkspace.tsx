import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import styled from '@mui/system/styled'
import { useForm, Controller } from 'react-hook-form'
import { addWorkspace, updateWorkspace } from '@/datasource/workspace'
import Dialog from '@mui/material/Dialog'
import { useAppDispatch } from '@/hooks/redux'
import { setWorkspace } from '@/features/workspace/slice'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'
import CircularLoading from '@soothe/ui/src/components/CircularLoading'
import LoadFailed from '@soothe/ui/src/components/LoadFailed'
import { useSnackbar } from 'notistack'
import PasswordStrengthBar from 'react-password-strength-bar'

const StyledForm = styled('form')(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  overflow: 'auto',
}))

interface IFormValues {
  name: string
  description?: string
  password: string
  confirmPassword: string
}

const emptyWorkspace: IFormValues = {
  name: '',
  description: '',
  password: '',
  confirmPassword: '',
}

interface AddWorkspaceProps {
  initializeAdded?: boolean
  runAfterAdded?: () => void
  onClickImport?: () => void
  onReset?: number
  workspaceToUpdate?: Omit<IFormValues, 'password' | 'confirmPassword'> & {
    _id: string
  }
}

const AddWorkspace: React.FC<AddWorkspaceProps> = ({
  initializeAdded,
  runAfterAdded,
  onClickImport,
  onReset,
  workspaceToUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [invalidPassword, setInvalidPassword] = useState(false)
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { handleSubmit, reset, register, formState, control } = useForm<IFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      ...emptyWorkspace,
      ...workspaceToUpdate,
    },
  })

  useEffect(() => {
    reset({
      ...emptyWorkspace,
      ...workspaceToUpdate,
    })

    // eslint-disable-next-line
  }, [onReset])

  const onChangePassword = useCallback(() => {
    setInvalidPassword(false)
  }, [])

  const onSubmit = useCallback(
    (data: IFormValues) => {
      setIsLoading(true)
      let promise: Promise<string | boolean>
      if (workspaceToUpdate) {
        promise = updateWorkspace(workspaceToUpdate._id, data.password, {
          name: data.name,
          description: data.description,
        })
      } else {
        promise = addWorkspace(
          {
            name: data.name,
            description: data.description,
          },
          data.password
        )
      }

      promise
        .then((response) => {
          if (typeof response === 'string') {
            if (initializeAdded) {
              dispatch(
                setWorkspace({
                  workspace: {
                    _id: response,
                    name: data.name,
                    description: data.description,
                  },
                  key: data.password,
                })
              )
            }
          }

          enqueueSnackbar(
            `Successfully ${workspaceToUpdate ? 'updated' : 'added'} "${data.name}" workspace.`,
            {
              variant: 'success',
              autoHideDuration: 4000,
            }
          )

          if (runAfterAdded) {
            runAfterAdded()
          }
        })
        .catch((err) => {
          if (err?.message === 'invalid_password') {
            setInvalidPassword(true)
          } else {
            setError(true)
          }
        })
        .finally(() => setIsLoading(false))
    },
    [initializeAdded, runAfterAdded, dispatch, workspaceToUpdate, enqueueSnackbar]
  )

  const onClickReload = useCallback(() => {
    setError(false)
    handleSubmit(onSubmit)()
  }, [handleSubmit, onSubmit])

  const disableApply = useMemo(() => {
    if (workspaceToUpdate) {
      return !formState.isDirty
    }

    return false
  }, [workspaceToUpdate, formState])

  const content = useMemo(() => {
    if (isLoading) {
      return <CircularLoading />
    }

    if (error) {
      return (
        <LoadFailed
          onReloadClick={onClickReload}
          loadText={'Operation Failed'}
          reloadText={'Please try again'}
          sxLoadText={{ width: 170 }}
        />
      )
    }

    const { errors } = formState

    return (
      <>
        <Typography
          variant={'body2'}
          overflow={'hidden'}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
          }}
          color={'gray'}
          display={initializeAdded ? 'block' : 'none'}
        >
          Before start using this awesome app add your first workspace.
        </Typography>

        <TextField
          autoFocus
          label={'Name'}
          autoComplete={'off'}
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name', { required: 'Required' })}
        />
        <TextField
          label={'Description'}
          autoComplete={'off'}
          multiline
          rows={3}
          {...register('description')}
        />
        <Controller
          control={control}
          name={'password'}
          rules={{ required: 'Required' }}
          render={({ field, fieldState: { error } }) => (
            <Stack>
              <TextField
                label={'Password'}
                type={'password'}
                error={!!error || invalidPassword}
                autoComplete={workspaceToUpdate ? 'current-password' : 'new-password'}
                helperText={error?.message || invalidPassword ? 'Password is invalid' : undefined}
                {...field}
                onChange={(event) => {
                  field.onChange(event)
                  onChangePassword()
                }}
              />
              {!error?.message && !invalidPassword && !workspaceToUpdate && (
                <PasswordStrengthBar
                  password={field.value}
                  shortScoreWord={'too weak'}
                  scoreWordStyle={{ fontSize: 12 }}
                />
              )}
            </Stack>
          )}
        />

        {!workspaceToUpdate && (
          <TextField
            type={'password'}
            label={'Confirm Password'}
            autoComplete={'new-password'}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Required',
              validate: (value, formValues) => {
                if (value === formValues.password) {
                  return true
                }

                return 'Passwords do not match'
              },
            })}
          />
        )}
      </>
    )
  }, [
    isLoading,
    error,
    initializeAdded,
    formState,
    register,
    control,
    onClickReload,
    workspaceToUpdate,
    onChangePassword,
    invalidPassword,
  ])

  return (
    <Stack
      sx={{
        height: { xs: '100%', sm: 520 },
        width: { xs: '100%', sm: 400 },
        maxWidth: '100vw',
        boxShadow: '1px 6px 20px 1px rgba(0,0,0,0.15)',
        borderRadius: { sm: '8px' },
        padding: '15px',
        boxSizing: { xs: 'border-box', sm: 'inherit' },
      }}
    >
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={'15px'} flexGrow={1}>
          <Typography variant={'h6'} marginTop={{ xs: '10px', sm: 0 }}>
            {workspaceToUpdate ? 'Update' : 'Add'} Workspace
          </Typography>
          {content}
        </Stack>
        <Stack justifyContent={'center'} direction={'row'}>
          {onClickImport && (
            <Button
              onClick={onClickImport}
              sx={{
                textTransform: 'none',
                width: 150,
                fontWeight: 600,
                height: 40,
              }}
            >
              Import
            </Button>
          )}
          <Button
            type={'submit'}
            variant={'outlined'}
            disabled={isLoading || error || disableApply}
            sx={{
              textTransform: 'none',
              width: 120,
              fontWeight: 700,
              height: 30,
            }}
          >
            Save
          </Button>
        </Stack>
      </StyledForm>
    </Stack>
  )
}

interface AddWorkspaceDialogProps extends AddWorkspaceProps {
  onClose: () => void
  open: boolean
}

export const AddWorkspaceDialog: React.FC<AddWorkspaceDialogProps> = ({
  open,
  onClose,
  ...otherProps
}) => {
  // const isXs = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'))
  const [resetCounter, setResetCounter] = useState(0)

  useEffect(() => {
    if (!open) {
      setResetCounter((prevState) => prevState++)
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: { xs: '100vh', sm: 'unset' },
          margin: { xs: 0, sm: 'unset' },
          maxHeight: { xs: '100vh', sm: 'unset' },
          width: { xs: '100vw', sm: 'unset' },
          position: 'relative',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 10,
          top: 10,
          zIndex: 10000,
        }}
      >
        <Close />
      </IconButton>
      <AddWorkspace onReset={resetCounter} {...otherProps} />
    </Dialog>
  )
}

export default AddWorkspace
