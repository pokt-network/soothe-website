import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { useFormContext } from 'react-hook-form'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import React, { useEffect, useRef, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CircularLoading from '@soothe/ui/src/components/CircularLoading'
import { displayConnectDialog, hideConnectDialog } from '@/features/connection/slice'
import { NetworksByChains, SupportedChains } from '@/constants/supportedChains'
import { ProviderItem } from '@/components/Connection/ProviderListDialog'
import ProviderService, { SupportedExtensionsProtocol } from '@/provider'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { add as addPurpose } from '@/features/purpose/slice'
import { OfflineTransferDs } from '@/datasource/transfer'
import { add } from '@/features/contact/slice'
import useDebounce from '@/hooks/useDebounce'
import { ContactType } from '@/constants'

// todo: change this (IMPROVE ABSTRACTION)
const extNetworkBySootheNetwork = {
  pokt: 'mainnet',
  ethereum: '0x1',
}

interface HashItemProps {
  hash: string
}

function HashItem({ hash }: HashItemProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const copyHash = () => {
    navigator.clipboard.writeText(hash).then(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 1000)
    })
  }

  return (
    <Stack spacing={0.5} direction={'row'} alignItems={'center'} justifyContent={'center'}>
      <Typography
        fontSize={12}
        sx={{
          wordBreak: 'break-all',
        }}
      >
        {hash}
      </Typography>
      <Tooltip title={'Copied'} open={showTooltip} arrow>
        <IconButton onClick={copyHash}>
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

interface SendToWalletProps {
  onBack: () => void
  onDone: () => void
}

export default function SendToWallet({ onBack, onDone }: SendToWalletProps) {
  const { watch } = useFormContext<TransferFormValues>()
  const values = watch()
  const { transfer_from } = values
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<
    | 'loading'
    | 'error'
    | 'not_connected'
    | 'user_rejected'
    | 'account_not_connected'
    | 'unexpected_account_not_connected'
    | 'transfer_sent_to_wallet'
    | 'could_not_connect_to_wallet'
    | 'transfer_completed'
    | 'expected_network_not_connected'
    | 'switching_network'
    | 'rejected_switch_network'
    | 'error_switching_network'
  >('not_connected')
  const transferRequestSent = useRef(false)
  const [hash, setHash] = useState('')

  const extensionProtocol =
    values.chain === SupportedChains.ethereum
      ? SupportedExtensionsProtocol.Ethereum
      : SupportedExtensionsProtocol.Pocket

  const providers = useAppSelector(
    (state) => state.connection.providersByProtocol[extensionProtocol]
  )
  const connection = useAppSelector(
    (state) => state.connection.connectionByProtocol[extensionProtocol]
  )
  const accountsMap = useAppSelector((state) => state.account.accountsMap)
  const workspaceKey = useAppSelector((state) => state.workspace.key)
  const workspace = useAppSelector((state) => state.workspace.workspace)

  const getProviderApi = async () => {
    const ProviderClass = ProviderService.getProviderClass(extensionProtocol)

    return ProviderClass.getProvider(connection.providerUuid).then((provider) => {
      return new ProviderClass(provider)
    })
  }

  const sendTransfer = async () => {
    try {
      if (status === 'transfer_sent_to_wallet' || transferRequestSent.current) return

      await getProviderApi().then(async (providerApi) => {
        const currentChain = await providerApi.getChainConnected()

        const expectedChain = extNetworkBySootheNetwork[values.network]

        if (currentChain !== expectedChain) {
          setStatus('expected_network_not_connected')
        } else {
          if (connection.showConnectDialog) {
            dispatch(hideConnectDialog(extensionProtocol))
          }

          setStatus('transfer_sent_to_wallet')
          transferRequestSent.current = true
          const hash = await providerApi.sendTransfer({
            from: values.transfer_from,
            to: values.new_contact_address || values.transfer_to,
            amount: Number(values.transfer_amount),
          })
          let purposeId = values.purpose

          if (values.adding_new_purpose && values.new_purpose_name) {
            const newPurpose = await dispatch(
              addPurpose({ name: values.new_purpose_name })
            ).unwrap()
            purposeId = newPurpose._id
          }

          if (values.new_contact_address && values.new_contact_name) {
            await dispatch(
              add({
                display_name: values.new_contact_name,
                type: ContactType.personal,
                last_name: '',
                company_name: '',
                first_name: '',
                phone_number: '',
                wallets: [
                  {
                    address: values.new_contact_address,
                    chain: values.chain as unknown as SupportedChains,
                  },
                ],
              })
            )
          }

          // todo: add support for backend datasource
          const offlineTransferDs = new OfflineTransferDs(workspace._id, workspaceKey)
          await offlineTransferDs.add({
            internal_memo: values.internal_memo.trim(),
            hash,
            purpose: purposeId,
          })

          setHash(hash)
          setStatus('transfer_completed')
          transferRequestSent.current = false
        }
      })
    } catch (e) {
      transferRequestSent.current = false

      if (e?.code === 40001 || e?.message?.includes('user rejected the request')) {
        setStatus('user_rejected')
      } else {
        console.log('send transfer err:', e)
        setStatus('error')
      }
    }
  }

  // to prevent reruns on useEffect
  const debouncedAccounts = useDebounce(connection?.accounts, 50)

  useEffect(() => {
    if (connection?.status === 'connected') {
      if (!connection.accounts.includes(values.transfer_from)) {
        setStatus('account_not_connected')
      } else {
        sendTransfer()
      }
    } else if (connection?.status === 'connecting') {
      setStatus('loading')
    } else {
      setStatus('not_connected')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAccounts])

  const backButton = (
    <Button
      variant={'outlined'}
      onClick={onBack}
      sx={(theme) => ({
        borderColor: theme.customColors.dark50,
        color: theme.customColors.dark75,
      })}
    >
      Back
    </Button>
  )

  const BoxStatus = () => {
    if (status === 'transfer_completed') {
      return (
        <Stack alignItems={'center'} justifyContent={'center'} spacing={1} height={158}>
          <Stack
            width={120}
            sx={{
              border: `1px solid lightgray`,
              boxSizing: 'border-box',
              borderRadius: '4px',
              height: 130,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DoneAllIcon color={'success'} sx={{ fontSize: 70 }} />
          </Stack>
        </Stack>
      )
    }

    if (connection?.status === 'connected') {
      const providerConnected = providers.find((item) => item.uuid === connection?.providerUuid)

      return (
        <Stack alignItems={'center'} justifyContent={'center'} spacing={1} height={158}>
          <Typography fontSize={12}>Currently connected to:</Typography>
          <Stack width={120} marginTop={1} marginBottom={1.5}>
            <ProviderItem providerInfo={providerConnected} />
          </Stack>
        </Stack>
      )
    }

    if (connection?.status === 'not_connected') {
      return (
        <Stack alignItems={'center'} justifyContent={'center'} spacing={1} height={158}>
          <Stack
            width={120}
            sx={{
              border: `1px solid lightgray`,
              boxSizing: 'border-box',
              borderRadius: '4px',
              height: 130,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 70 }} color={'error'} />
          </Stack>
        </Stack>
      )
    }

    return null
  }

  const BackAndOtherButton = ({ otherButton }: { otherButton: React.ReactNode }) => {
    return (
      <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} spacing={1.5}>
        {backButton}
        {otherButton}
      </Stack>
    )
  }
  const handleConnectionButton = (
    <Button
      variant={'outlined'}
      onClick={() => {
        dispatch(displayConnectDialog(extensionProtocol))
      }}
    >
      Handle Connection
    </Button>
  )

  const sendTransferButton = (
    <Button variant={'outlined'} onClick={sendTransfer}>
      Send Transfer again
    </Button>
  )

  const switchChainButton = (
    <Button
      variant={'outlined'}
      onClick={async () => {
        try {
          setStatus('switching_network')
          const providerApi = await getProviderApi()
          await providerApi.switchNetwork(extNetworkBySootheNetwork[values.network])

          setTimeout(sendTransfer, 100)
        } catch (e) {
          if (e?.code === 40001 || e?.message?.includes('user rejected the request')) {
            setStatus('rejected_switch_network')
          } else {
            setStatus('error_switching_network')
          }
        }
      }}
    >
      {status !== 'expected_network_not_connected' ? 'Try again' : 'Switch to expected network'}
    </Button>
  )

  const networkLabel = NetworksByChains[values.chain].find(
    (item) => item.value === values.network
  )?.label

  let content: React.ReactNode

  switch (status) {
    case 'loading':
      content = <CircularLoading />
      break
    case 'error':
      content = (
        <>
          <BoxStatus />
          <Typography>There was an error trying to sent the transfer with your wallet.</Typography>
          <BackAndOtherButton otherButton={sendTransferButton} />
        </>
      )
      break
    case 'not_connected':
      content = (
        <>
          <BoxStatus />
          <Typography>You are not connected to any wallet</Typography>
          <BackAndOtherButton otherButton={handleConnectionButton} />
        </>
      )
      break
    case 'user_rejected':
      content = (
        <>
          <BoxStatus />
          <Typography>You rejected the request to send the transfer.</Typography>
          <BackAndOtherButton otherButton={sendTransferButton} />
        </>
      )
      break
    case 'account_not_connected':
      const accountLabel = `"${accountsMap[values.transfer_from]} (${transfer_from.substring(
        0,
        4
      )}...${transfer_from.substring(transfer_from.length - 4)})"`

      content = (
        <>
          <BoxStatus />
          <Typography textAlign={'center'}>
            The {accountLabel} account from where you intent to transfer is not currently connected
            to your wallet.
            <br />
            <span style={{ fontSize: 12 }}>
              If you are unable to connect to the desire account from here, go to your wallet,
              disconnect from our website and try again.
            </span>{' '}
            <br />
            <span style={{ fontSize: 12 }}>
              After you connection includes to {accountLabel} your transfer request will be sent to
              your wallet.
            </span>
          </Typography>
          <BackAndOtherButton otherButton={handleConnectionButton} />
        </>
      )
      break
    case 'unexpected_account_not_connected':
      content = (
        <>
          <BoxStatus />
          <Typography>
            Ops. It seems that your account is not really connected with your wallet or does not
            have permissions to send transfer.
          </Typography>
          <BackAndOtherButton otherButton={handleConnectionButton} />
        </>
      )
      break
    case 'transfer_sent_to_wallet':
      content = (
        <>
          <BoxStatus />
          <Typography>Your transfer request was sent to your wallet. Please confirm it!</Typography>
        </>
      )
      break
    case 'could_not_connect_to_wallet':
      content = (
        <>
          <Typography>We are unable to connect with your wallet</Typography>
          {backButton}
        </>
      )
      break
    case 'transfer_completed':
      content = (
        <>
          <BoxStatus />
          <Typography>Your transfer was successfully sent! Here is the hash:</Typography>
          <HashItem hash={hash} />
          <Button variant={'contained'} onClick={onDone}>
            Done
          </Button>
        </>
      )
      break
    case 'expected_network_not_connected':
      content = (
        <>
          <BoxStatus />
          <Typography>
            You are not connected to {networkLabel} in your wallet. After you switch to{' '}
            {networkLabel} your transfer will be sent.
          </Typography>
          <BackAndOtherButton otherButton={switchChainButton} />
        </>
      )
      break
    case 'switching_network':
      content = (
        <>
          <BoxStatus />
          <CircularProgress />
          <Typography>Switching to {networkLabel}</Typography>
        </>
      )
      break
    case 'rejected_switch_network':
      content = (
        <>
          <BoxStatus />
          <Typography>You rejected to switch to {networkLabel} in your wallet</Typography>
          <BackAndOtherButton otherButton={switchChainButton} />
        </>
      )
      break
    case 'error_switching_network':
      content = (
        <>
          <BoxStatus />
          <Typography>There was an error switching to {networkLabel} in your wallet.</Typography>
          <Typography fontSize={12}>
            If your current wallet does not support switch network request. If you can change
            networks in your wallet go and change it to {networkLabel} network.
          </Typography>
          <BackAndOtherButton otherButton={switchChainButton} />
        </>
      )
      break
  }

  return (
    <Stack flexGrow={1} alignItems={'center'} justifyContent={'center'} spacing={1.5}>
      {content}
    </Stack>
  )
}
