import type { Workspace } from '@/types'
import Stack from '@mui/material/Stack'
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { EventHandler, useCallback, useRef, useState } from 'react'
import { setWorkspace } from '@/features/workspace/slice'
import { loginOnWorkspace } from '@/datasource/workspace'
import { useAppDispatch } from '@/hooks/redux'

interface LogInWorkspaceProps {
  workspace: Workspace
  onCancel: () => void
}

const LogInWorkspace: React.FC<LogInWorkspaceProps> = ({ workspace, onCancel }) => {
  const passwordRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const dispatch = useAppDispatch()

  const onChangeTextInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value)
  }, [])

  const onChangeRemember = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(event.target.checked)
  }, [])

  const onClickLogin = useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      if (!text) return
      setIsLoading(true)
      loginOnWorkspace(workspace._id, text)
        .then((result) => {
          if (result) {
            enqueueSnackbar(`Successfully login in "${workspace.name}" workspace!`, {
              variant: 'success',
              autoHideDuration: 4000,
            })
            dispatch(
              setWorkspace({
                workspace: {
                  _id: workspace._id,
                  name: workspace.name,
                  description: workspace.description,
                },
                key: text,
              })
            )
          } else {
            enqueueSnackbar(`Wrong password to login in "${workspace.name}" workspace.`, {
              variant: 'error',
              autoHideDuration: 4000,
            })
            passwordRef.current?.focus()
          }
        })
        .finally(() => setIsLoading(false))
    },
    [workspace, text, enqueueSnackbar, dispatch]
  )

  return (
    <Stack
      sx={{
        height: { xs: '100%', sm: 520 },
        width: { xs: '100%', sm: 400 },
        boxShadow: '1px 6px 20px 1px rgba(0,0,0,0.15)',
        borderRadius: { sm: '8px' },
        padding: '15px',
      }}
      justifyContent={'space-between'}
      component={'form'}
      onSubmit={onClickLogin}
    >
      <Stack spacing={'15px'}>
        <Typography variant={'h6'} marginTop={{ xs: '10px', sm: 0 }}>
          Log In Workspace
        </Typography>

        <Typography variant={'body1'} marginTop={'30px!important'}>
          {workspace.name}
        </Typography>

        <Typography variant={'body2'} overflow={'hidden'} color={'gray'} height={150}>
          {workspace.description}
        </Typography>

        <TextField
          autoFocus
          inputRef={passwordRef}
          label={'Password'}
          type={'password'}
          value={text}
          onChange={onChangeTextInput}
          autoComplete={'current-password'}
        />

        {/*<Stack direction={'row'} alignItems={'center'} marginTop={'5px!important'}>*/}
        {/*  <Checkbox size={'small'} onChange={onChangeRemember}/>*/}
        {/*  <Typography fontSize={12} color={'darkslategrey'}>Remember me (1 hour)</Typography>*/}
        {/*</Stack>*/}
      </Stack>

      <Stack direction={'row'} spacing={'20px'} alignItems={'center'} justifyContent={'center'}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button disabled={!text || isLoading} onClick={onClickLogin} variant={'contained'}>
          Log In
        </Button>
      </Stack>
    </Stack>
  )
}

export default LogInWorkspace
