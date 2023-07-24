import React from 'react'
import WalletSummary from '@/components/Wallet/Summary'
import Stack from '@mui/material/Stack'
import TransferTable from '@/components/Wallet/TransferTable'
import type { Account } from '@/types'

interface SummaryProps {
  account: Account
}

const WalletDetail: React.FC<SummaryProps> = (props) => {
  return (
    <Stack flexGrow={1}>
      <WalletSummary {...props} />
      <TransferTable address={props.account.address} chain={props.account.chain} />
    </Stack>
  )
}

export default WalletDetail
