import type { TypographyProps } from '@mui/material'
import type { Account } from '@/types'
import type { AccountWithBalance } from '@/components/Account/List'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Stack from '@mui/material/Stack'
import { useSnackbar } from 'notistack'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { useRouter } from 'next/navigation'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import QrCodeIcon from '@mui/icons-material/QrCode'
import { useGetAccountBalance, useGetSummaryOfAccount } from '@/hooks/chains'
import CreateUpdateDialog from '@/components/Account/CreateUpdateDialog'
import { useFetchPricesQuery } from '@/features/cryptoPrice/slice'
import TransferDialog from '@/components/Transfer/TransferDialog'
import ButtonMenu from '@soothe/ui/src/components/ButtonMenu'
import CopyIcon from '@soothe/ui/src/assets/icons/copy.svg'
import ViewDialog from '@/components/Account/ViewDialog'
import DatasourceByChain from '@/datasource/chains'
import { remove } from '@/features/account/slice'
import { useAppDispatch } from '@/hooks/redux'
import { roundAndSeparate } from '@/utils'

interface SummaryProps {
  account: Account
}

const WalletSummary: React.FC<SummaryProps> = ({ account }) => {
  const theme = useTheme()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account>(null)
  const [accountToTransfer, setAccountToTransfer] = useState<AccountWithBalance>(null)
  const { isLoading, error, balance, getBalance } = useGetAccountBalance()
  const { data: dataPrices, isLoading: isLoadingPrices } = useFetchPricesQuery()
  const {
    isLoading: loadingSummary,
    summary,
    error: errorSummary,
  } = useGetSummaryOfAccount(account.address, account.chain)

  const isLoadingBalance = isLoading || (balance === null && !error)
  const isLoadingSummary = loadingSummary || (summary === null && !errorSummary)

  useEffect(() => {
    getBalance(account.address, account.chain)
    // eslint-disable-next-line
  }, [account])

  const toggleViewAccount = useCallback(() => {
    setShowViewDialog((prevState) => !prevState)
  }, [])

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
        router.push('/')
        enqueueSnackbar(`Successfully removed "${account.name}" account.`, {
          variant: 'success',
          autoHideDuration: 4000,
        })
      })
    },
    [enqueueSnackbar, dispatch, router]
  )

  const onSelectedAccountToEdit = useCallback((account: Account) => {
    setAccountToEdit(account)
  }, [])

  const onCloseEditAccount = useCallback(() => {
    setAccountToEdit(null)
  }, [])

  const onCloseTransferDialog = useCallback(() => {
    setAccountToTransfer(null)
  }, [])

  const onSelectedAccountToTransfer = useCallback((account: Account) => {
    setAccountToTransfer(account)
  }, [])

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

  const chainToUsd: number = useMemo(() => {
    return dataPrices?.[account.chain]?.price
  }, [account.chain, dataPrices])

  const headerComponent = useMemo(() => {
    const typographyProps: TypographyProps = {
      color: theme.customColors.primary500,
      letterSpacing: '0.5px',
      fontWeight: 600,
      variant: 'h5',
    }

    return (
      <Stack
        direction={'row'}
        alignItems={'center'}
        height={60}
        spacing={1.5}
        paddingX={'20px'}
        borderBottom={`1px solid ${theme.customColors.dark25}`}
        sx={{
          a: {
            color: theme.customColors.primary500,
          },
        }}
      >
        <Link href={'/'}>
          <Typography {...typographyProps}>Accounts&nbsp;&nbsp;{'>'}</Typography>
        </Link>
        <Stack pt={0.2}>
          <Stack direction={'row'} spacing={0.5}>
            <Typography
              display={'inline'}
              textTransform={'uppercase'}
              {...typographyProps}
              color={theme.customColors.dark100}
            >
              {account.name}
            </Typography>
            <IconButton onClick={toggleViewAccount}>
              <QrCodeIcon sx={{ color: theme.customColors.dark100, fontSize: 25 }} />
            </IconButton>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} spacing={0.5}>
            <Typography variant={'body2'} color={theme.customColors.dark50} fontWeight={500}>
              {account.address}
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
      </Stack>
    )
  }, [account, toggleViewAccount, theme, onClickCopyAddress, showCopyTooltip])

  const summaryItemsComponent = useMemo(() => {
    if (!DatasourceByChain[account.chain].getTransferMonthSummaryForAccount) return

    const pendingBalance = summary?.pending_balance

    let color: string

    if (!pendingBalance) {
      color = theme.customColors.dark100
    } else if (pendingBalance > 0) {
      color = theme.customColors.dark_green
    } else {
      color = theme.customColors.red
    }

    return [
      {
        value: roundAndSeparate(summary?.pending_balance, 2, '0'),
        label: 'Pending',
        color,
      },
      {
        value: roundAndSeparate(summary?.amount_transferred),
        label: 'Transfer / Month',
      },
      {
        value: roundAndSeparate(summary?.amount_deposited),
        label: 'Deposits / Month',
      },
      {
        value: roundAndSeparate(summary?.transfers),
        label: 'Transfer Txns',
      },
      {
        value: roundAndSeparate(summary?.deposits),
        label: 'Deposit Txns',
      },
      {
        value: roundAndSeparate(summary?.failed_transfers),
        label: 'Failed Txns',
      },
    ].map(({ value, label, color }) => (
      <Stack key={label} height={60} justifyContent={'flex-end'} width={1}>
        {isLoadingSummary ? (
          <Skeleton variant={'rectangular'} height={32} width={100} animation={'wave'} />
        ) : (
          <Typography variant={'h4'} fontWeight={600} color={color}>
            {value}
          </Typography>
        )}
        <Typography variant={'body2'}>{label}</Typography>
      </Stack>
    ))
  }, [isLoadingSummary, summary, account.chain, theme])

  return (
    <>
      <ViewDialog
        open={showViewDialog}
        wallet={account}
        onClose={toggleViewAccount}
        name={account.name}
      />
      <CreateUpdateDialog
        open={!!accountToEdit}
        onClose={onCloseEditAccount}
        accountToEdit={accountToEdit}
      />
      {accountToTransfer && (
        <TransferDialog
          account={accountToTransfer}
          open={!!accountToTransfer}
          onClose={onCloseTransferDialog}
        />
      )}
      <Stack
        border={`1px solid ${theme.customColors.dark50}`}
        height={190}
        boxShadow={'0px 0px 4px rgba(0, 0, 0, 0.2)'}
        bgcolor={theme.customColors.white}
        borderRadius={'2px'}
      >
        {headerComponent}
        <Stack
          direction={'row'}
          height={130}
          alignItems={'center'}
          spacing={1.5}
          px={2}
          bgcolor={theme.customColors.dark2}
        >
          <Stack direction={'row'} pt={3} pb={4} width={'100%'}>
            <Stack height={60} justifyContent={'flex-end'} width={1}>
              {isLoadingBalance ? (
                <Skeleton variant={'rectangular'} height={42} width={150} animation={'wave'} />
              ) : (
                <Typography variant={'h1'} fontWeight={600}>
                  {roundAndSeparate(balance || 0)}
                </Typography>
              )}
              <Typography variant={'body2'}>Available balance</Typography>
            </Stack>
            <Stack height={60} justifyContent={'flex-end'} width={1}>
              {isLoadingBalance || isLoadingPrices ? (
                <Skeleton variant={'rectangular'} height={32} width={100} animation={'wave'} />
              ) : (
                <Typography variant={'h4'} fontWeight={600}>
                  ${roundAndSeparate((balance || 0) * chainToUsd, 2, '0')}
                </Typography>
              )}
              <Typography variant={'body2'}>Account value</Typography>
            </Stack>
            {summaryItemsComponent}
          </Stack>

          <Stack direction={'row'} spacing={'10px'} height={'100%'} pt={2} boxSizing={'border-box'}>
            <Button
              variant={'outlined'}
              sx={{
                height: 30,
                width: 80,
              }}
              onClick={() => onSelectedAccountToTransfer(account)}
            >
              Transfer
            </Button>
            <ButtonMenu
              label={'More'}
              options={[
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
      </Stack>
    </>
  )
}

export default WalletSummary
