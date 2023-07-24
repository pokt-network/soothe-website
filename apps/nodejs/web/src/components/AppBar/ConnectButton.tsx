import React, { useCallback, useEffect, useRef, useState } from 'react'
import get from 'lodash/get'
import Button from '@mui/material/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  disconnectFromVault,
  establishVaultConnection,
  initializeVaultConnection,
  reset,
} from '@/features/connection/slice'

const ConnectButton: React.FC = () => {
  const { status, permissions } = useAppSelector((state) => state.connection)
  const dispatch = useAppDispatch()
  useEffect(() => {
    window.postMessage(
      {
        to: 'VAULT_KEYRING',
        type: 'CHECK_CONNECTION_REQUEST',
      },
      '*'
    )

    const messageListener = (event: MessageEvent) => {
      const { data } = event

      if (data?.from === 'VAULT_KEYRING' && data?.type === 'CONNECTION_RESPONSE') {
        const connectionEstablished = get(data, 'data.connectionEstablished', false)
        const permissions = get(data, 'data.connectionEstablished', [])
        if (connectionEstablished && permissions?.length && status === 'not_connected') {
          dispatch(initializeVaultConnection(permissions))
        }
      }

      if (data?.from === 'VAULT_KEYRING' && data?.type === 'DISCONNECT_RESPONSE') {
        const disconnected = get(data, 'data.disconnected', false)
        if (disconnected) {
          dispatch(reset())
        }
      }
    }

    window.addEventListener('message', messageListener)

    return () => {
      window.removeEventListener('message', messageListener)
    }
  }, [])

  const onClickConnect = useCallback(() => {
    if (status === 'not_connected') {
      dispatch(establishVaultConnection())
    } else if (status === 'connected') {
      dispatch(disconnectFromVault())
    }
  }, [status, dispatch])

  const text =
    status === 'not_connected' ? 'Connect' : status === 'connected' ? 'Connected' : 'Connecting'

  return (
    <Button
      variant={'contained'}
      sx={{ textTransform: 'uppercase', marginRight: '20px!important' }}
      onClick={onClickConnect}
    >
      {text}
    </Button>
  )
}

export default ConnectButton
