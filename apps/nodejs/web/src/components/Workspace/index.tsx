'use client'

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import List from '@/components/Workspace/List'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { initialize as initializeAccounts, reset as resetAccounts } from '@/features/account/slice'
import { initialize as initializeContacts, reset as resetContacts } from '@/features/contact/slice'
import Cookies from 'js-cookie'
import CryptoJs from 'crypto-js'
import moment, { Moment } from 'moment-timezone'
import { KEY_ENC_DATA, SESSION_COOKIE_NAME } from '@/constants'
import { loginAndReturnWorkspace } from '@/datasource/workspace'
import { clearWorkspace, setWorkspace } from '@/features/workspace/slice'
import { useSnackbar } from 'notistack'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/CloseRounded'

interface WorkspaceProps {
  children: React.ReactNode
}

const SESSION_EXPIRED_SNACKBAR_KEY = 'session-expired-inactivity'

const Workspace: React.FC<WorkspaceProps> = ({ children }) => {
  const workspaceKey = useAppSelector((state) => state.workspace.key)
  const workspace = useAppSelector((state) => state.workspace.workspace)
  const dispatch = useAppDispatch()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const sessionCookie = useRef<boolean>(false)
  const lastActivityDateRef = useRef<Moment>(null)

  const setLastActivityDateRef = useCallback(() => {
    lastActivityDateRef.current = moment().utc()
  }, [])

  useEffect(() => {
    if (workspaceKey && workspace) {
      dispatch(initializeAccounts({ key: workspaceKey, workspaceId: workspace._id }))
      dispatch(initializeContacts({ key: workspaceKey, workspaceId: workspace._id }))
      setSessionCookie(workspace._id, workspaceKey)
      sessionCookie.current = true
    }
    // eslint-disable-next-line
  }, [workspaceKey])

  const clearSession = useCallback(() => {
    const val = Cookies.get(SESSION_COOKIE_NAME)

    if (!val && sessionCookie.current) {
      const currentDate = moment().utc()
      const diffLastActivity = currentDate.diff(lastActivityDateRef.current, 'minutes', true)

      if (diffLastActivity > 5) {
        dispatch(clearWorkspace())
        dispatch(resetAccounts())
        dispatch(resetContacts())
        sessionCookie.current = false
        enqueueSnackbar(
          <Stack
            direction={'row'}
            alignItems={'center'}
            width={300}
            justifyContent={'space-between'}
          >
            Your session has expired due to inactivity.
            <IconButton
              onClick={() => closeSnackbar(SESSION_EXPIRED_SNACKBAR_KEY)}
              sx={{
                width: 30,
                height: 30,
                '& path': {
                  fill: 'white',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>,
          {
            variant: 'error',
            preventDuplicate: true,
            persist: true,
            autoHideDuration: null,
            key: SESSION_EXPIRED_SNACKBAR_KEY,
          }
        )
      } else {
        setSessionCookie(workspace._id, workspaceKey)
      }
    } else if (val) {
      sessionCookie.current = true
    }
  }, [dispatch, enqueueSnackbar, workspace, workspaceKey, closeSnackbar])

  useEffect(() => {
    const interval = setInterval(() => {
      clearSession()
    }, 5000)

    document.addEventListener('click', setLastActivityDateRef)
    document.addEventListener('scroll', setLastActivityDateRef)
    document.addEventListener('mousemove', setLastActivityDateRef)

    return () => {
      clearInterval(interval)
      document.removeEventListener('click', setLastActivityDateRef)
      document.removeEventListener('scroll', setLastActivityDateRef)
      document.removeEventListener('mousemove', setLastActivityDateRef)
    }
  }, [clearSession, setLastActivityDateRef])

  useEffect(() => {
    loginIfSession()
      .then((response) => {
        if (response) {
          const { workspace, key } = response

          dispatch(
            setWorkspace({
              workspace,
              key,
            })
          )
        }
      })
      .catch()
    // eslint-disable-next-line
  }, [])

  const content = useMemo(() => {
    return workspaceKey ? (
      children
    ) : (
      <Box
        sx={{
          height: 'calc(100vh - 16px)',
          width: 'calc(100vw - 0px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <List />
      </Box>
    )
  }, [workspaceKey, children])

  return <>{content}</>
}

const setSessionCookie = (workspaceId: string, key: string) => {
  const jsonStringified = JSON.stringify({ workspaceId, key })
  const value = CryptoJs.AES.encrypt(jsonStringified, KEY_ENC_DATA).toString()

  Cookies.set(SESSION_COOKIE_NAME, value, {
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
    expires: moment().utc().add(1, 'hour').toDate(),
  })
}

const loginIfSession = async () => {
  const valueEncrypted = Cookies.get(SESSION_COOKIE_NAME)

  if (valueEncrypted) {
    const decrypted = CryptoJs.AES.decrypt(valueEncrypted, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    if (decrypted) {
      try {
        const { workspaceId, key } = JSON.parse(decrypted)

        if (workspaceId && key) {
          return loginAndReturnWorkspace(workspaceId, key)
        }
      } catch (e) {}
    }
  }

  return null
}

export default Workspace
