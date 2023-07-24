'use client'

import type { Account } from '@/types'
import Stack from '@mui/material/Stack'
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import { useRouter } from 'next/navigation'
import Tooltip from '@mui/material/Tooltip'
import Skeleton from '@mui/material/Skeleton'
import Accordion from '@mui/material/Accordion'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import QrCodeIcon from '@mui/icons-material/QrCode'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import React, { useCallback, useMemo, useState } from 'react'
import CopyIcon from '@soothe/ui/src/assets/icons/copy.svg'
import ButtonMenu from '@soothe/ui/src/components/ButtonMenu'
import FilledDownArrowIcon from '@soothe/ui/src/assets/icons/filled_down_arrow.svg'
import { DataByChain, SupportedChains } from '@/constants/supportedChains'
import { getChainSupportPendingBalance } from '@/utils/chains'
import { remove } from '@/features/account/slice'
import { useAppDispatch } from '@/hooks/redux'
import { roundAndSeparate } from '@/utils'

export const searchAccounts = (rawSearchText: string, accounts: Account[], returnOnOne = false) => {
  const searchText = rawSearchText.trim().toLowerCase()
  const results: Account[] = []

  for (const account of accounts) {
    const { address, name, description } = account
    if (
      address.toLowerCase().includes(searchText) ||
      name.toLowerCase().includes(searchText) ||
      description?.toLowerCase()?.includes(searchText)
    ) {
      results.push(account)

      if (returnOnOne) {
        return results
      }
    }
  }

  return results
}

interface ListItemProps {
  onRemoveAccount: (account: Account) => void
  onOpenViewAccount: (account: Account) => void
  onSelectedAccountToEdit: (account: Account) => void
  onSelectedAccountToTransfer: (account: AccountWithBalance) => void
  account: AccountWithBalance
  isLoadingPendingBalances?: boolean
  isLoadingBalance?: boolean
  isLoadingPrices?: boolean
  cryptoToUsd?: number
}

const ListItem: React.FC<ListItemProps> = ({
  account,
  isLoadingPendingBalances,
  isLoadingBalance,
  isLoadingPrices,
  onSelectedAccountToEdit,
  onSelectedAccountToTransfer,
  onRemoveAccount,
  onOpenViewAccount,
}) => {
  const theme = useTheme()
  const router = useRouter()
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)

  const onClickCopyAddress = useCallback(() => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address).then(() => {
        setShowCopyTooltip(true)
        setTimeout(() => {
          setShowCopyTooltip(false)
        }, 700)
      })
    }
  }, [account?.address])

  const pendingComponent = useMemo(() => {
    const supportPending = getChainSupportPendingBalance(account.chain)
    if (!supportPending) return null

    const { pendingBalance } = account

    let color: string

    if (!pendingBalance) {
      color = theme.customColors.dark100
    } else if (pendingBalance > 0) {
      color = theme.customColors.dark_green
    } else {
      color = theme.customColors.red
    }

    return (
      <Stack height={60} justifyContent={'flex-end'} width={'33.3%'}>
        {isLoadingPendingBalances ? (
          <Skeleton variant={'rectangular'} height={32} width={100} animation={'wave'} />
        ) : (
          <Typography variant={'h4'} fontWeight={600} color={color}>
            {roundAndSeparate(pendingBalance || 0, 2, '0')}
          </Typography>
        )}
        <Typography variant={'body2'}>Pending</Typography>
      </Stack>
    )
  }, [account, isLoadingPendingBalances, theme])

  const { address, name } = account
  return (
    <Stack
      key={address}
      borderTop={`1px solid ${theme.customColors.dark25}`}
      justifyContent={'space-between'}
      height={170}
    >
      <Stack
        direction={'row'}
        justifyContent={'center'}
        height={60}
        minHeight={60}
        bgcolor={theme.customColors.dark2}
        paddingX={2}
      >
        <Stack width={'100%'} justifyContent={'center'}>
          <Stack direction={'row'} width={'100%'} alignItems={'center'}>
            <Typography
              textTransform={'uppercase'}
              color={theme.customColors.dark100}
              variant={'h6'}
              fontWeight={600}
            >
              {name}
            </Typography>
            <IconButton
              onClick={() => onOpenViewAccount(account)}
              sx={{ marginLeft: '10px', padding: 0, marginTop: -0.3 }}
            >
              <QrCodeIcon sx={{ color: theme.customColors.dark100, fontSize: 25 }} />
            </IconButton>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} spacing={0.5}>
            <Typography variant={'body2'} color={theme.customColors.dark50} fontWeight={500}>
              {address}
            </Typography>
            <Tooltip title={'Copied'} open={showCopyTooltip}>
              <IconButton onClick={onClickCopyAddress}>
                <Stack
                  sx={{
                    width: 20,
                    height: 20,
                    '& path, rect': { transform: 'scale(0.67)', stroke: theme.customColors.dark50 },
                  }}
                >
                  <CopyIcon />
                </Stack>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction={'row'} spacing={'10px'} alignItems={'center'}>
          <Button
            variant={'outlined'}
            onClick={() => onSelectedAccountToTransfer(account)}
            sx={{
              height: 30,
              width: 80,
            }}
          >
            Transfer
          </Button>
          <ButtonMenu
            label={'More'}
            options={[
              {
                label: 'Detail',
                onClick: () => router.push(`/account/${account.address}`),
              },
              {
                label: 'Edit',
                onClick: () => onSelectedAccountToEdit(account),
              },
              {
                label: 'Remove',
                onClick: () => onRemoveAccount(account),
              },
            ]}
          />
        </Stack>
      </Stack>

      <Stack direction={'row'} pt={3} pb={2} px={2}>
        <Stack height={60} justifyContent={'flex-end'} width={'33.3%'}>
          {isLoadingBalance ? (
            <Skeleton variant={'rectangular'} height={42} width={150} animation={'wave'} />
          ) : (
            <Typography variant={'h1'} fontWeight={600}>
              {roundAndSeparate(account.balance || 0)}
            </Typography>
          )}
          <Typography variant={'body2'}>Available balance</Typography>
        </Stack>
        <Stack height={60} justifyContent={'flex-end'} width={'33.3%'}>
          {isLoadingBalance || isLoadingPrices ? (
            <Skeleton variant={'rectangular'} height={32} width={100} animation={'wave'} />
          ) : (
            <Typography variant={'h4'} fontWeight={600}>
              ${roundAndSeparate(account.usdBalance || 0, 2, '0')}
            </Typography>
          )}
          <Typography variant={'body2'}>Account value</Typography>
        </Stack>
        {pendingComponent}
      </Stack>
    </Stack>
  )
}

export interface AccountWithBalance extends Account {
  balance?: number
  pendingBalance?: number
  usdBalance?: number
}

interface ListAccountProps {
  chain: SupportedChains
  accounts: AccountWithBalance[]
  isLast?: boolean
  isLoadingPrices?: boolean
  isLoadingBalance?: boolean
  isLoadingPendingBalances?: boolean
  onOpenViewAccount: (account: Account) => void
  onSelectedAccountToTransfer: (account: Account) => void
  onSelectedAccountToEdit: (account: Account) => void
}

const List = ({
  chain,
  onOpenViewAccount,
  onSelectedAccountToTransfer,
  onSelectedAccountToEdit,
  accounts,
  isLoadingPendingBalances,
  isLoadingBalance,
  isLoadingPrices,
  isLast,
}: ListAccountProps) => {
  const theme = useTheme()

  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()

  const onRemoveAccount = useCallback(
    (account: Account) => {
      dispatch(remove(account._id)).then((response) => {
        if ('error' in response) {
          enqueueSnackbar(`Error while trying to remove "${account.name}" account.`, {
            variant: 'error',
            autoHideDuration: 4000,
          })
          return
        }

        enqueueSnackbar(`Successfully removed "${account.name}" account.`, {
          variant: 'success',
          autoHideDuration: 4000,
        })
      })
    },
    [enqueueSnackbar, dispatch]
  )

  const accountsComponent = useMemo(() => {
    return accounts.map((account) => (
      <ListItem
        key={account._id}
        account={account}
        onSelectedAccountToTransfer={onSelectedAccountToTransfer}
        onSelectedAccountToEdit={onSelectedAccountToEdit}
        onOpenViewAccount={onOpenViewAccount}
        onRemoveAccount={onRemoveAccount}
        isLoadingPrices={isLoadingPrices}
        isLoadingBalance={isLoadingBalance}
        isLoadingPendingBalances={isLoadingPendingBalances}
      />
    ))
  }, [
    accounts,
    isLoadingPrices,
    isLoadingBalance,
    isLoadingPendingBalances,
    onRemoveAccount,
    onOpenViewAccount,
    onSelectedAccountToEdit,
    onSelectedAccountToTransfer,
  ])

  const { label, icon: Icon } = useMemo(() => {
    return DataByChain[chain]
  }, [chain])

  return (
    <>
      <Accordion
        sx={{
          border: `1px solid ${theme.customColors.dark50}`,
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
          borderRadius: '2px',
          marginTop: '0!important',
          marginBottom: isLast ? '0px!important' : '30px!important',
        }}
        elevation={0}
        defaultExpanded={true}
      >
        <AccordionSummary
          expandIcon={<FilledDownArrowIcon />}
          sx={{
            paddingLeft: '5px!important',
            maxHeight: 60,
            minHeight: '60px!important',
            flexDirection: 'row-reverse',
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
              transform: 'rotate(0deg)',
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              transform: 'rotate(270deg)',
            },
          }}
        >
          <Stack
            direction={'row'}
            spacing={'10px'}
            alignItems={'center'}
            marginLeft={'5px'}
            height={60}
          >
            <Stack
              sx={{
                height: 26,
                width: 26,
                '& path': {
                  transform: 'scale(0.87)',
                },
              }}
            >
              <Icon />
            </Stack>
            <Typography color={theme.customColors.dark100} variant={'h5'} fontWeight={600}>
              {label}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0, marginTop: '-10px' }}>
          <Stack marginTop={'10px'} spacing={'10px'}>
            {accountsComponent}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default List
