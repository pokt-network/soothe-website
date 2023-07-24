import type { Account, Contact } from '@/types'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Controller, useForm } from 'react-hook-form'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, { useCallback, useEffect, useMemo } from 'react'
import { DataByChain, NetworksByChains } from '@/constants/supportedChains'
import DialogHeader from '@/components/common/DialogHeader'
import { useAppSelector } from '@/hooks/redux'
import AmountHelperText from '@/components/Transfer/AmountHelperText'
import CustomDivider from '@/components/Transfer/CustomDivider'
import { useGetTransferFeeByChain } from '@/hooks/chains'
import WalletAutocomplete from '@/components/Transfer/WalletAutocomplete'
import PurposeAutocomplete from '@/components/Transfer/PurposeAutocomplete'
import TransferTo from '@/components/Transfer/TransferTo'

interface TransferDialogProps {
  account: Account
  accountBalance: number
  open: boolean
  onClose: () => void
}

const purposes = [
  {
    label: 'Asset Sales',
    value: 'asset_sales',
  },
  {
    label: 'Customer Payment',
    value: 'customer_payment',
  },
] as const

interface IFormValues {
  network: string
  transfer_amount: string
  transfer_to: string
  purpose: string
  internal_memo?: string
  recipient_message?: string
  new_contact_name?: string
  new_contact_address?: string
}

const TransferDialog: React.FC<TransferDialogProps> = ({
  accountBalance,
  account,
  open,
  onClose,
}) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))

  const { setValue, control, register, clearErrors, handleSubmit } = useForm<IFormValues>({
    mode: 'all',
    defaultValues: {
      network: '',
      transfer_amount: '',
      transfer_to: '',
      purpose: purposes[0].value,
      internal_memo: '',
      recipient_message: '',
    },
  })

  const contacts = useAppSelector((state) => state.contact.contacts) as Contact[]
  const accounts: Account[] = useAppSelector(
    (state) => state.account.accountsByChain[account?.chain]
  )

  const { isLoading: isLoadingFee, fee } = useGetTransferFeeByChain(account?.chain)

  const chainWallets = useMemo(() => {
    if (!account?.chain) return []

    const wallets = []

    for (const contact of contacts) {
      for (const wallet of contact.wallets) {
        if (wallet.chain === account.chain) {
          wallets.push({
            id: wallet.chain + wallet.address,
            name: contact.display_name,
            address: wallet.address,
            alias: wallet.alias,
          })
        }
      }
    }

    for (const acc of accounts) {
      if (acc.address === account.address) continue

      wallets.push({
        id: acc._id,
        name: acc.name,
        address: acc.address,
      })
    }

    return wallets
  }, [contacts, accounts, account])

  const networks = useMemo(() => {
    return NetworksByChains[account?.chain] || []
  }, [account?.chain])

  useEffect(() => {
    if (account?.chain) {
      setValue('network', networks[0].value)
    }
    // eslint-disable-next-line
  }, [account?.chain])

  const onSubmit = useCallback((data) => {
    console.log(data)
  }, [])

  const onClickAll = useCallback(() => {
    const transferFromBalance = accountBalance - (fee || 0)

    if (transferFromBalance) {
      setValue('transfer_amount', (transferFromBalance || '').toString())
      clearErrors('transfer_amount')
    }
  }, [setValue, accountBalance, clearErrors, fee])

  const transferFromText = useMemo(() => {
    if (!account) {
      return ''
    }

    const address = account.address

    const lastCharacters = address.substring(address.length - 4).toUpperCase()

    return `${account.name} (...${lastCharacters})`
  }, [account])

  const networkByChains = useMemo(() => {
    return NetworksByChains[account?.chain] || []
  }, [account?.chain])

  return (
    <Dialog open={open} onClose={onClose} maxWidth={'md'} fullWidth={true} fullScreen={isXs}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader onClose={onClose}>
          <Typography variant={'h6'} color={theme.customColors.white} fontWeight={700}>
            Transfer - <span style={{ fontWeight: 400 }}>{DataByChain[account?.chain]?.code}</span>
          </Typography>
        </DialogHeader>
        <DialogContent
          sx={{
            padding: '20px!important',
            height: { xs: 'calc(100vh - 120px)', sm: 'unset', md: 405 },
            minHeight: { sm: 405, md: 'unset' },
            maxHeight: { sm: 451, md: 'unset' },
            boxSizing: 'border-box',
          }}
        >
          <Grid container columnSpacing={'20px'}>
            <Grid item xs={12} sm={6}>
              <Controller
                name={'network'}
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    size={'small'}
                    label={'Network'}
                    disabled={networks.length === 1}
                    {...field}
                  >
                    {networkByChains.map(({ label, value }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              display={{ xs: networkByChains.length === 1 ? 'block' : 'none', sm: 'block' }}
            >
              {networkByChains.length === 1 && (
                <Typography
                  fontSize={{ xs: 13, md: 14 }}
                  height={{ sm: 40 }}
                  marginTop={{ xs: 0.5, sm: 0 }}
                >
                  This account can only send {networkByChains[0].label} through{' '}
                  {networkByChains[0].label} Network.
                </Typography>
              )}
            </Grid>

            <CustomDivider />

            <Grid item xs={12} sm={6}>
              <TextField
                label={'Transfer from'}
                value={transferFromText}
                size={'small'}
                fullWidth
                sx={{
                  pointerEvents: 'none',
                }}
              />
            </Grid>

            <CustomDivider justXs={true} />

            <Grid item xs={12} sm={6}>
              <TransferTo
                control={control}
                setValue={setValue}
                clearErrors={clearErrors}
                wallets={chainWallets}
                chain={account?.chain}
              />
            </Grid>

            <CustomDivider />

            <Grid item xs={12} sm={6} paddingBottom={{ xs: 1, sm: 0.5 }} height={55}>
              <Controller
                name={'transfer_amount'}
                control={control}
                rules={{
                  required: 'Required',
                  max: {
                    value: accountBalance,
                    message: 'Higher than account balance',
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    label={'Transfer amount'}
                    size={'small'}
                    type={'number'}
                    fullWidth
                    InputLabelProps={{
                      shrink: !!field.value,
                    }}
                    error={!!error}
                    sx={{
                      '& .MuiFormHelperText-root': {
                        left: 0,
                        width: 1,
                        bottom: -32,
                      },
                    }}
                    helperText={
                      <AmountHelperText
                        accountBalance={accountBalance}
                        onClickAll={onClickAll}
                        isLoadingFee={isLoadingFee}
                        transferFee={fee}
                      />
                    }
                    {...field}
                  />
                )}
              />
            </Grid>

            <CustomDivider justXs={true} />

            <Grid item xs={12} sm={6}>
              <PurposeAutocomplete
                purposes={purposes}
                name={'purpose'}
                control={control}
                textFieldProps={{ label: 'Purpose' }}
              />
            </Grid>

            <CustomDivider />

            <Grid item xs={12} sm={6}>
              <TextField
                multiline
                rows={5}
                fullWidth
                label={'Message to recipient'}
                size={'small'}
                {...register('recipient_message')}
              />
            </Grid>

            <CustomDivider justXs={true} />

            <Grid item xs={12} sm={6}>
              <TextField
                multiline
                rows={5}
                size={'small'}
                label={'Memo for internal record keeping'}
                fullWidth
                {...register('internal_memo')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type={'submit'} variant={'outlined'}>
            Submit
          </Button>
          <Button onClick={onClose} variant={'outlined-cancel'}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TransferDialog
