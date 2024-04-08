import type { Account } from '@/types'
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import useMediaQuery from '@mui/material/useMediaQuery'
import React from 'react'
import { DataByChain } from '@/constants/supportedChains'
import DialogHeader from '@/components/common/DialogHeader'
import TransferForm from '@/components/Transfer/TransferForm'

interface TransferDialogProps {
  account: Account
  open: boolean
  onClose: () => void
}

export default function NewTransferDialog({ account, open, onClose }: TransferDialogProps) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))

  return (
    <Dialog open={open} onClose={onClose} maxWidth={'md'} fullWidth={true} fullScreen={isXs}>
      <DialogHeader onClose={onClose}>
        <Typography variant={'h6'} color={theme.customColors.white} fontWeight={700}>
          Transfer - <span style={{ fontWeight: 400 }}>{DataByChain[account?.chain]?.code}</span>
        </Typography>
      </DialogHeader>
      <DialogContent
        sx={{
          padding: '0px!important',
          height: { xs: 'calc(100vh - 120px)', sm: 'unset', md: 480 },
          minHeight: { sm: 405, md: 'unset' },
          maxHeight: { sm: 510, md: 'unset' },
          boxSizing: 'border-box',
        }}
      >
        <TransferForm
          summaryIsStep={true}
          fromAccount={account}
          onCancel={onClose}
          onDone={onClose}
          containerProps={{ border: 'none', height: 1, boxSizing: 'border-box' }}
          buttonsContainerProps={{ marginTop: 0, paddingX: 0 }}
        />
      </DialogContent>
    </Dialog>
  )
}
