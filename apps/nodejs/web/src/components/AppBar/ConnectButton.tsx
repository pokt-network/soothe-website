import React, { useCallback, useEffect, useRef } from 'react'
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  displayConnectDialog,
  hideConnectDialog,
  resetConnection,
  setAccounts,
} from '@/features/connection/slice'
import ProviderService, { SupportedExtensionsProtocol } from '@/provider'
import ProviderListDialog from '@/components/Connection/ProviderListDialog'
import EthereumIcon from '@/assets/icons/chains/ethereum.svg'
import PocketIcon from '@/assets/icons/chains/pocket.svg'

interface ConnectButtonProps {
  protocol: SupportedExtensionsProtocol
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ protocol }) => {
  const { enqueueSnackbar } = useSnackbar()

  const providers = useAppSelector((state) => state.connection.providersByProtocol[protocol])
  const connection = useAppSelector((state) => state.connection.connectionByProtocol[protocol])
  const status = connection?.status || 'not_connected'
  const currentUuid = useRef<string>(null)
  const providersWithListener = useRef<Record<string, boolean>>({})

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (connection?.status === 'connected') {
      currentUuid.current = connection.providerUuid
      if (!providersWithListener.current[connection.providerUuid]) {
        providersWithListener.current[connection.providerUuid] = true

        ProviderService.getProviderClass(protocol)
          .getProvider(connection.providerUuid)
          .then((provider) => {
            const uuid = connection.providerUuid

            provider?.on('accountsChanged', (accounts) => {
              if (uuid === currentUuid.current) {
                if (accounts.length) {
                  dispatch(setAccounts({ accounts, protocol }))
                } else {
                  dispatch(resetConnection(protocol))
                }
              }
            })
          })
      }
    } else {
    }
  }, [connection])

  const onClickConnect = useCallback(async () => {
    try {
      if (providers.length) {
        dispatch(displayConnectDialog(protocol))
      } else if (!providers.length) {
        enqueueSnackbar('Provider not found', {
          variant: 'error',
          preventDuplicate: true,
          key: `${protocol}_provider_not_found`,
          autoHideDuration: 4000,
        })
      }
    } catch (e) {
      if (ProviderService.isNotFoundError(e)) {
        enqueueSnackbar(e.message, {
          variant: 'error',
          preventDuplicate: true,
          key: `${protocol}_provider_not_found`,
          autoHideDuration: 4000,
        })
      }
    }
  }, [dispatch, protocol, enqueueSnackbar, providers])

  const text =
    status === 'not_connected' ? 'Connect' : status === 'connected' ? 'Connected' : 'Connecting'

  return (
    <>
      <Button
        variant={'outlined'}
        sx={{
          backgroundColor: 'rgba(255,255,255, 0.05)',
          textTransform: 'uppercase',
          marginRight: '20px!important',
          '& svg': {
            transform: 'scale(0.6)',
          },
        }}
        onClick={onClickConnect}
      >
        {protocol === SupportedExtensionsProtocol.Pocket ? <PocketIcon /> : <EthereumIcon />}
        {text}
      </Button>
      <ProviderListDialog
        open={!!connection?.showConnectDialog}
        onClose={() => dispatch(hideConnectDialog(protocol))}
        protocol={protocol}
      />
    </>
  )
}

export default ConnectButton
