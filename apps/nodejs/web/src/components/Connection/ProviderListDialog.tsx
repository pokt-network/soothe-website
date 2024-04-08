import type { Theme } from '@mui/material'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, { useEffect, useRef, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { connectToWallet, resetConnection } from '@/features/connection/slice'
import LoadFailed from '@soothe/ui/src/components/LoadFailed'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import DialogHeader from '@/components/common/DialogHeader'
import { SupportedExtensionsProtocol } from '@/provider'
import { ProviderInfo } from '@/provider/base'

interface AddressItemProps {
  address: string
}

function AddressItem({ address }: AddressItemProps) {
  const accountsMap = useAppSelector((state) => state.account.accountsMap)
  const [showTooltip, setShowTooltip] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(address).then(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 1000)
    })
  }

  let label = address

  if (accountsMap[address]) {
    label = `${accountsMap[address]} (${address.substring(0, 4)}...${address.substring(
      address.length - 4
    )})`
  }

  return (
    <Stack
      width={1}
      height={30}
      minHeight={30}
      spacing={1}
      direction={'row'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Typography fontSize={12} noWrap={true} maxWidth={'calc(100% - 40px)'}>
        {label}
      </Typography>
      <Tooltip title={'Copied'} open={showTooltip} arrow>
        <IconButton onClick={copyAddress}>
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

interface ProviderItemProps {
  providerInfo: ProviderInfo
}

export function ProviderItem({ providerInfo: { name, icon } }: ProviderItemProps) {
  return (
    <Stack
      sx={{
        border: `1px solid lightgray`,
        boxSizing: 'border-box',
        borderRadius: '4px',
        paddingTop: 1,
        height: 130,
        width: 1,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img height={80} width={80} src={icon} alt={`${name} icon`} />
      <Typography noWrap={true} marginTop={0.7} maxWidth={'calc(100% - 10px)'}>
        {name}
      </Typography>
    </Stack>
  )
}

interface ProviderListDialogProps {
  open: boolean
  onClose: () => void
  protocol: SupportedExtensionsProtocol
}

export default function ProviderListDialog({ open, onClose, protocol }: ProviderListDialogProps) {
  const dispatch = useAppDispatch()
  const providers = useAppSelector((state) => state.connection.providersByProtocol[protocol])
  const connection = useAppSelector((state) => state.connection.connectionByProtocol[protocol])
  const [status, setStatus] = useState<'list' | 'loading' | 'error' | 'user_rejected'>('list')
  const lastClickedProvider = useRef<ProviderInfo>(null)
  const isXs = useMediaQuery((theme) => (theme as Theme).breakpoints.only('xs'))

  useEffect(() => {
    if (open) {
      setStatus('list')
    }
  }, [open])

  const onClickWallet = async (providerInfo: ProviderInfo) => {
    setStatus('loading')
    try {
      lastClickedProvider.current = providerInfo
      const accounts = await dispatch(
        connectToWallet({ protocol, uuid: providerInfo.uuid })
      ).unwrap()

      console.log({ protocol, accounts })

      lastClickedProvider.current = null

      setStatus('list')
    } catch (e) {
      console.log(e)
      if (e?.code === 4001 || e?.message?.toLowerCase()?.includes('user rejected the request')) {
        return setStatus('user_rejected')
      }
      setStatus('error')
    }
  }

  let content: React.ReactNode

  if (connection?.status === 'connected') {
    const providerConnected = providers.find((item) => item.uuid === connection?.providerUuid)

    content = (
      <Stack height={1}>
        <Stack height={220} minHeight={220} alignItems={'center'} justifyContent={'center'}>
          <Stack
            direction={'row'}
            alignItems={'center'}
            justifyContent={'center'}
            spacing={0.7}
            marginTop={'-20px!important'}
          >
            <Typography fontSize={12}>Connected to:</Typography>
          </Stack>
          {providerConnected && (
            <Stack width={120} marginTop={1} marginBottom={1.5}>
              <ProviderItem providerInfo={providerConnected} />
            </Stack>
          )}

          <Button
            variant={'outlined'}
            onClick={() => {
              dispatch(resetConnection(protocol))
            }}
          >
            Disconnect
          </Button>
        </Stack>
        <Stack
          paddingX={0.5}
          flexGrow={1}
          overflow={'auto'}
          borderTop={`1px solid lightgray`}
          divider={
            <Divider
              flexItem={true}
              sx={{
                borderColor: `lightgray`,
              }}
            />
          }
        >
          {connection.accounts.map((address) => (
            <AddressItem key={address} address={address} />
          ))}
        </Stack>
      </Stack>
    )
  } else {
    switch (status) {
      case 'list':
        content = providers.length ? (
          <Stack spacing={1}>
            <Typography>Select the wallet to connect with it</Typography>
            <Stack
              flexGrow={1}
              display={'grid'}
              gridTemplateColumns={'repeat(auto-fit, minmax(110px, 1fr))'}
              columnGap={1.5}
              rowGap={1.5}
              overflow={'auto'}
            >
              {providers.map((info) => (
                <IconButton
                  key={info.uuid}
                  onClick={() => onClickWallet(info)}
                  sx={{ backgroundColor: 'transparent!important' }}
                >
                  <ProviderItem providerInfo={info} />
                </IconButton>
              ))}
            </Stack>
          </Stack>
        ) : (
          <Stack height={1} width={1} alignItems={'center'} justifyContent={'center'}>
            <Typography textAlign={'center'} marginTop={-2}>
              You {"don't"} have any wallet installed. Please install at least one and reload the
              page.
            </Typography>
          </Stack>
        )
        break
      case 'loading':
        const providerConnectingTo = providers.find(
          (item) => item.uuid === connection?.providerUuid
        )

        content = (
          <Stack height={1} alignItems={'center'} justifyContent={'center'} spacing={2}>
            {providerConnectingTo && (
              <Stack width={120} marginTop={'-30px!important'}>
                <ProviderItem providerInfo={providerConnectingTo} />
              </Stack>
            )}

            <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} spacing={0.7}>
              <CircularProgress size={16} />
              <Typography fontSize={12}>Connecting...</Typography>
            </Stack>
          </Stack>
        )
        break
      case 'user_rejected': {
        const providerConnectingTo = lastClickedProvider.current

        content = (
          <Stack height={1} alignItems={'center'} justifyContent={'center'} spacing={2}>
            {providerConnectingTo && (
              <Stack width={120} marginTop={'-30px!important'}>
                <ProviderItem providerInfo={providerConnectingTo} />
              </Stack>
            )}

            <Typography fontSize={12} color={'error'} fontWeight={600}>
              CONNECTION REJECTED
            </Typography>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} spacing={1.5}>
              <Button
                variant={'outlined'}
                onClick={() => {
                  setStatus('list')
                  lastClickedProvider.current = null
                }}
              >
                Cancel
              </Button>
              <Button
                variant={'contained'}
                onClick={() => onClickWallet(lastClickedProvider.current)}
              >
                Retry
              </Button>
            </Stack>
          </Stack>
        )
        break
      }
      case 'error': {
        content = (
          <LoadFailed
            onReloadClick={() => onClickWallet(lastClickedProvider.current)}
            loadText={`There was an error connecting to\n${lastClickedProvider.current?.name}`}
            sxLoadText={{
              fontSize: 14,
              width: 300,
              textAlign: 'center',
              whiteSpace: 'pre-line',
            }}
            reloadText={'Retry'}
            sxReloadText={{
              marginTop: 2.5,
            }}
          />
        )
        break
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      fullScreen={isXs}
      PaperProps={{
        sx: {
          maxWidth: { sm: 400 },
        },
      }}
    >
      <DialogHeader onClose={onClose}>Connect to Wallet</DialogHeader>
      <DialogContent
        sx={{
          padding: '20px!important',
          height: { xs: 'calc(100vh - 120px)', sm: 355 },
          boxSizing: 'border-box',
        }}
      >
        {content}
      </DialogContent>
    </Dialog>
  )
}
