'use client'

import React, { useEffect, useState } from 'react'
import { Account } from '@/types'
import { useAppSelector } from '@/hooks/redux'
import Stack from '@mui/material/Stack'
import { CircularProgress } from '@mui/material'
import Typography from '@mui/material/Typography'
import WalletDetail from '@/components/Wallet'

interface AccountDetailProps {
  address: string
}

const AccountDetail: React.FC<AccountDetailProps> = ({ address }) => {
  const [account, setAccount] = useState<Account>(null)
  const { accounts, loading } = useAppSelector((state) => state.account)

  useEffect(() => {
    if (!loading) {
      const accountFromStore = accounts.find((item) => item.address === address)

      if (accountFromStore) {
        setAccount(accountFromStore)
      }
    }
  }, [accounts])

  if (loading) {
    return (
      <Stack
        height={'calc(100vh - 50px)'}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <CircularProgress size={80} />
      </Stack>
    )
  }

  if (!account) {
    return (
      <Stack
        height={'calc(100vh - 50px)'}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Typography>You do not have an account with this address {`"${address}"`}.</Typography>
      </Stack>
    )
  }

  return <WalletDetail account={account} />
}

export default AccountDetail
