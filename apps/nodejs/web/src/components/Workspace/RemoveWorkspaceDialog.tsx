import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSnackbar } from 'notistack'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import LoadFailed from '@soothe/ui/src/components/LoadFailed'
import CircularLoading from '@soothe/ui/src/components/CircularLoading'
import DialogHeader from '@/components/common/DialogHeader'
import { removeWorkspace } from '@/datasource/workspace'

interface RemoveWorkspaceDialogProps {
  open: boolean
  onClose: () => void
  onRunAfterRemove: () => void
  workspace?: {
    name: string
    _id: string
  }
}

const RemoveWorkspaceDialog: React.FC<RemoveWorkspaceDialogProps> = ({
  open,
  onClose,
  workspace,
  onRunAfterRemove,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const [password, setPassword] = useState('')
  const [invalidPassword, setInvalidPassword] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!open) {
      setPassword('')
      setInvalidPassword(false)
      setError(false)
      setIsLoading(false)
    }
  }, [open])

  const onChangePassword = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
    setInvalidPassword(false)
  }, [])

  const onClickRemove = useCallback(() => {
    if (workspace?._id) {
      setIsLoading(true)
      removeWorkspace(workspace._id, password)
        .then(() => {
          enqueueSnackbar(`Successfully removed "${workspace.name}" workspace.`, {
            variant: 'success',
            autoHideDuration: 4000,
          })
          if (onRunAfterRemove) {
            onRunAfterRemove()
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
    }
  }, [workspace, onRunAfterRemove, password, enqueueSnackbar])

  const content = useMemo(() => {
    if (isLoading) {
      return <CircularLoading />
    }

    if (error) {
      return (
        <LoadFailed
          onReloadClick={onClickRemove}
          loadText={'Operation Failed'}
          reloadText={'Please try again'}
          sxLoadText={{ width: 170 }}
        />
      )
    }

    return (
      <>
        <Typography mb={1} variant={'h6'}>
          Are you sure you want to remove {`"${workspace?.name}"`} workspace and all its content?
          This can not be undone.
        </Typography>
        <Typography mb={0.7}> Enter the password of {`"${workspace?.name}"`} workspace.</Typography>
        <TextField
          placeholder={'Password'}
          type={'password'}
          value={password}
          onChange={onChangePassword}
          size={'small'}
          error={invalidPassword}
          autoComplete={'current-password'}
          helperText={invalidPassword ? 'Password is not valid' : undefined}
        />
      </>
    )
  }, [workspace, onClickRemove, isLoading, error, password, onChangePassword, invalidPassword])

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true}>
      <DialogHeader onClose={onClose}>Remove Workspace</DialogHeader>
      <DialogContent
        sx={{
          height: { xs: 190, sm: 135 },
          padding: { xs: '10px!important', sm: '20px!important' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {content}
      </DialogContent>
      <DialogActions>
        <Button variant={'outlined'} disabled={isLoading || error} onClick={onClickRemove}>
          Yes
        </Button>
        <Button variant={'outlined-cancel'} onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RemoveWorkspaceDialog
