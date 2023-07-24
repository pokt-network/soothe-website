import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { importWorkspace, ImportWorkspaceResult } from '@/datasource/workspace'
import { CircularProgress } from '@mui/material'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  runAfterImport?: () => void
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, runAfterImport }) => {
  const [file, setFile] = useState<File>()
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<ImportWorkspaceResult>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onChangeFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files![0])
    } else {
      setFile(null)
    }
  }, [])

  const onChangePassword = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }, [])

  const onClickImport = useCallback(async () => {
    if (file && password) {
      const content = await file.text()

      setIsLoading(true)
      const result = await importWorkspace(content, password)
      setResult(result)
      setIsLoading(false)

      if (result === 'imported' && runAfterImport) {
        runAfterImport()
      }
    }
  }, [file, password, runAfterImport])

  useEffect(() => {
    setPassword('')
    setFile(null)
    setResult(null)
  }, [open])

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <Stack flexGrow={1} alignItems={'center'} justifyContent={'center'} height={'100%'}>
          <CircularProgress size={80} />
        </Stack>
      )
    }

    if (!result) {
      return (
        <Stack spacing={'20px'} justifyContent={'center'}>
          <Typography fontSize={12}>
            To import a workspace you need to load the workspace file (should be .json file) and
            enter the password of the workspace.
          </Typography>
          <input
            style={{ display: 'block' }}
            type={'file'}
            accept={'application/json'}
            onChange={onChangeFileInput}
          />
          <TextField
            value={password}
            onChange={onChangePassword}
            label={' Workspace Password'}
            type={'password'}
          />
        </Stack>
      )
    }

    if (result) {
      let text: string

      switch (result) {
        case 'invalid_json':
          text = 'The imported file is not valid'
          break
        case 'invalid_password':
          text = 'The password is not valid'
          break
        case 'unknown_error':
          text = 'An unknown error occur'
          break
        case 'imported':
          text = 'The workspace have been imported!'
          break
        case 'already_exists':
          text = 'You already have this workspace.'
          break
        case 'address_repeated':
          text = 'An address is being used several times for the same Asset.'
          break
      }

      const onClick =
        result !== 'invalid_password'
          ? onClose
          : () => {
              setResult(null)
              setPassword('')
            }

      return (
        <Stack
          flexGrow={1}
          alignItems={'center'}
          justifyContent={'center'}
          height={'100%'}
          spacing={'10px'}
        >
          <Typography>{text}</Typography>
          <Button onClick={onClick}>Close</Button>
        </Stack>
      )
    }
  }, [result, password, onChangePassword, onChangeFileInput, isLoading, onClose])

  return (
    <Dialog open={open} onClose={onClose} maxWidth={'xs'} fullWidth={true}>
      <DialogTitle>Import Workspace</DialogTitle>
      <DialogContent sx={{ height: 300 }}>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onClickImport} disabled={!file || !password}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportDialog
