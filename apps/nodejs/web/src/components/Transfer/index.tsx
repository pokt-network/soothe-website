'use client'

import type { Account, Contact, LabelAndValue } from '@/types'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { roundAndSeparate } from '@/utils'
import { useAppSelector } from '@/hooks/redux'
import { useGetBalances, useGetTransferFeeByChain } from '@/hooks/chains'
import AssetSelect from '@/components/common/AssetSelect'
import AmountHelperText from '@/components/Transfer/AmountHelperText'
import BaseCustomDivider, { CustomDividerProps } from '@/components/Transfer/CustomDivider'
import { labelByChainMap, NetworksByChains, SupportedChains } from '@/constants/supportedChains'
import { isEmpty } from 'lodash'
import WalletAutocomplete from '@/components/Transfer/WalletAutocomplete'
import PurposeAutocomplete from '@/components/Transfer/PurposeAutocomplete'
import TransferTo from '@/components/Transfer/TransferTo'

const CustomDivider: React.FC<CustomDividerProps> = (props) => {
  return <BaseCustomDivider sxDividerProps={{ marginTop: 2.5, mb: 2, marginX: -1 }} {...props} />
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

interface FormValues {
  chain: string
  network: string
  transfer_from: string
  transfer_to: string
  transfer_amount: string
  purpose: string
  recipient_message: string
  internal_memo: string
  new_contact_name?: string
  new_contact_address?: string
}

interface RowProps {
  row: LabelAndValue<string | undefined>
}

const Row = ({ row: { label, value } }: RowProps) => {
  const theme = useTheme()
  return (
    <Stack direction={'row'} spacing={1.5}>
      <Typography
        width={100}
        textAlign={'right'}
        fontWeight={600}
        letterSpacing={'0.5px'}
        variant={'body2'}
      >
        {label}:
      </Typography>
      <Typography
        color={theme.customColors.dark75}
        width={'100%'}
        letterSpacing={'0.5px'}
        sx={{ wordBreak: 'break-all' }}
        variant={'body2'}
      >
        {value}
      </Typography>
    </Stack>
  )
}

const TransferSummary = ({ control }) => {
  const values = useWatch<FormValues>({
    control,
  })

  const { accountsMap } = useAppSelector((state) => state.account)
  const { contactsMap } = useAppSelector((state) => state.contact)

  const rows: LabelAndValue<string | undefined>[] = useMemo(() => {
    const {
      chain,
      network,
      transfer_from,
      transfer_to,
      transfer_amount,
      purpose,
      recipient_message,
      new_contact_address,
      new_contact_name,
    } = values

    let transferFrom: string, transferTo: string

    if (transfer_from) {
      const accountName = accountsMap[transfer_from]

      if (accountName) {
        const lastCharacters = transfer_from.substring(transfer_from.length - 10)

        transferFrom = `${accountName} (...${lastCharacters})`
      } else {
        transferFrom = transfer_from
      }
    } else {
      transferFrom = ''
    }

    if (transfer_to) {
      const accountName = contactsMap[transfer_to] || accountsMap[transfer_to]

      if (accountName) {
        if (accountName.includes('(') && accountName.includes(')')) {
          transferTo = accountName
        } else {
          const lastCharacters = transfer_to.substring(transfer_to.length - 10)
          transferTo = `${accountName} (...${lastCharacters})`
        }
      } else {
        transferTo = transfer_to
      }
    } else if (new_contact_address || new_contact_name) {
      const lastCharacters = new_contact_address
        ? ` (...${new_contact_address.substring(new_contact_address.length - 10)})`
        : ''

      transferTo = `${new_contact_name}${lastCharacters}`
    } else {
      transferTo = ''
    }

    return [
      {
        label: 'Asset',
        value: labelByChainMap[chain],
      },
      {
        label: 'Network',
        value: NetworksByChains[chain]?.find((item) => item.value === network)?.label,
      },
      {
        label: 'From',
        value: transferFrom,
      },
      {
        label: 'To',
        value: transferTo,
      },
      {
        label: 'Transfer Amount',
        value: transfer_amount ? `$${roundAndSeparate(Number(transfer_amount), 6)}` : '',
      },
      {
        label: 'Purpose',
        value: purposes.find((item) => item.value === purpose)?.label || purpose,
      },
      {
        label: 'Message to recipient',
        value: recipient_message,
      },
    ]
  }, [values, accountsMap, contactsMap])

  return (
    <Stack flexGrow={1} spacing={'10px'}>
      {rows.map((row) => (
        <Row key={row.label} row={row} />
      ))}
    </Stack>
  )
}

const Transfer: React.FC = () => {
  const theme = useTheme()

  const {
    watch,
    register,
    setValue,
    getValues,
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
  } = useForm<FormValues>({
    defaultValues: {
      chain: '',
      network: '',
      transfer_from: '',
      transfer_to: '',
      transfer_amount: '',
      purpose: purposes[0].value,
      internal_memo: '',
      recipient_message: '',
    },
  })
  const [selectedChain, transferFrom] = watch(['chain', 'transfer_from']) as [
    SupportedChains,
    string
  ]

  const { accountsByChain } = useAppSelector((state) => state.account)
  const contacts = useAppSelector((state) => state.contact.contacts) as Contact[]

  const { isLoading: isLoadingFee, fee } = useGetTransferFeeByChain(selectedChain)

  const chains = useMemo(() => {
    if (!accountsByChain) return []

    return Object.keys(accountsByChain) as SupportedChains[]
  }, [accountsByChain])

  useEffect(() => {
    let network = ''
    if (NetworksByChains[selectedChain]?.length === 1) {
      network = NetworksByChains[selectedChain][0].value
    }

    setValue('network', network)
    setValue('transfer_from', '')
    setValue('transfer_to', '')
    setValue('new_contact_name', '')
    setValue('new_contact_address', '')
    // eslint-disable-next-line
  }, [selectedChain])

  useEffect(() => {
    setValue('transfer_amount', '')
    const transferTo = getValues('transfer_to')

    if (transferTo === transferFrom) {
      setValue('transfer_to', '')
    }
    // eslint-disable-next-line
  }, [transferFrom])

  const accounts: Account[] = useMemo(() => {
    if (selectedChain) {
      return accountsByChain[selectedChain]
    }

    return []
  }, [accountsByChain, selectedChain])

  const chainWallets = useMemo(() => {
    if (!selectedChain) return []

    const wallets = []

    for (const contact of contacts) {
      for (const wallet of contact.wallets) {
        if (wallet.chain === selectedChain) {
          wallets.push({
            id: contact._id + wallet.address,
            name: contact.display_name,
            address: wallet.address,
            alias: wallet.alias,
          })
        }
      }
    }

    for (const acc of accounts) {
      if (acc.address === transferFrom) continue

      wallets.push({
        id: acc._id + acc.address,
        name: acc.name,
        address: acc.address,
      })
    }

    return wallets
  }, [contacts, accounts, selectedChain, transferFrom])

  const {
    balanceByAddress: accountBalances,
    getBalances: getAccountBalances,
    isLoading: isLoadingAccountBalances,
  } = useGetBalances()

  useEffect(() => {
    if (selectedChain && accountsByChain[selectedChain]?.length) {
      getAccountBalances(
        accountsByChain[selectedChain].map((item) => item.address),
        selectedChain
      )
    }
    // eslint-disable-next-line
  }, [selectedChain])

  const balanceByAddressMap: Record<string, number> = useMemo(() => {
    if (isLoadingAccountBalances || !selectedChain) return {} as Record<string, number>

    return accountBalances.reduce<Record<string, number>>(
      (acc, item) => ({ ...acc, [item.address]: item.balance }),
      {}
    )
  }, [selectedChain, isLoadingAccountBalances, accountBalances])

  const onClickAll = useCallback(() => {
    const transferFromBalance = (balanceByAddressMap[transferFrom] || 0) - (fee || 0)

    if (transferFromBalance) {
      setValue('transfer_amount', (transferFromBalance || '').toString())
      clearErrors('transfer_amount')
    }
  }, [balanceByAddressMap, transferFrom, setValue, clearErrors, fee])

  const onSubmit = useCallback((data) => {
    console.log(data)
  }, [])

  const networkByChains = useMemo(() => {
    return NetworksByChains[selectedChain] || []
  }, [selectedChain])

  return (
    <Stack
      border={`1px solid ${theme.customColors.dark50}`}
      boxShadow={'0px 0px 4px rgba(0, 0, 0, 0.2)'}
      borderRadius={'2px'}
      bgcolor={theme.customColors.dark2}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container paddingTop={2} paddingX={3}>
          <Grid item container xs={12} lg={8} columnSpacing={'20px'}>
            <Grid item xs={12} sm={6}>
              <AssetSelect
                chains={chains}
                {...register('chain', { required: 'Required' })}
                error={!!errors.chain}
                helperText={errors.chain?.message}
              />
            </Grid>
            <CustomDivider justXs />
            <Grid item xs={12} sm={6}>
              <Controller
                name={'network'}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    select
                    fullWidth
                    size={'small'}
                    label={'Network'}
                    disabled={!selectedChain}
                    SelectProps={{
                      IconComponent: networkByChains.length === 1 ? null : undefined,
                    }}
                    {...field}
                    error={!!error}
                    helperText={
                      error?.message || networkByChains.length === 1
                        ? `Can only send through ${networkByChains[0].label} network.`
                        : ''
                    }
                  >
                    {networkByChains.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <CustomDivider />
            <Grid item xs={12} sm={6}>
              <WalletAutocomplete
                name={'transfer_from'}
                control={control}
                wallets={accounts}
                rules={{ required: 'Required' }}
                textFieldProps={{
                  label: 'Transfer From',
                  disabled: !selectedChain,
                }}
                disabled={!selectedChain}
              />
            </Grid>
            <CustomDivider justXs />
            <Grid item xs={12} sm={6}>
              <TransferTo
                control={control}
                setValue={setValue}
                clearErrors={clearErrors}
                wallets={chainWallets}
                chain={selectedChain}
                disabled={!selectedChain || !transferFrom}
              />
            </Grid>
            <CustomDivider />

            <Grid item xs={12} sm={6} paddingBottom={{ xs: 1, sm: 0.5 }} height={50}>
              <Controller
                name={'transfer_amount'}
                control={control}
                rules={{
                  required: 'Required',
                  max: {
                    value: balanceByAddressMap[transferFrom] - fee,
                    message: 'Higher than account balance',
                  },
                  min: 0.01,
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    label={'Transfer amount'}
                    size={'small'}
                    type={'number'}
                    disabled={!transferFrom}
                    fullWidth
                    sx={{
                      '& .MuiFormHelperText-root': {
                        left: 10,
                        bottom: -32,
                        width: 'calc(100% - 20px)',
                      },
                    }}
                    InputLabelProps={{
                      shrink: !!field.value,
                    }}
                    error={!!error}
                    helperText={
                      <AmountHelperText
                        accountBalance={balanceByAddressMap[transferFrom] || 0}
                        onClickAll={onClickAll}
                        isLoadingBalance={isLoadingAccountBalances && !!transferFrom}
                        isLoadingFee={isLoadingFee}
                        transferFee={fee}
                      />
                    }
                    {...field}
                  />
                )}
              />
            </Grid>
            <CustomDivider justXs />

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
            <CustomDivider justXs />

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

          <Grid
            item
            xs={12}
            lg={4}
            sx={{ display: 'flex', flexGrow: 1 }}
            paddingLeft={{ lg: 3 }}
            marginTop={{ xs: 2, lg: 0 }}
          >
            <Stack
              flexGrow={1}
              border={`1px solid ${theme.customColors.primary500}`}
              borderRadius={'8px'}
              maxWidth={'100%'}
              paddingY={1.5}
              paddingX={2}
            >
              <Typography
                height={30}
                textAlign={'center'}
                letterSpacing={'0.5px'}
                fontWeight={600}
                marginBottom={1}
              >
                Transfer Summary
              </Typography>
              <Divider sx={{ marginBottom: 2.5 }} />
              <TransferSummary control={control} />
            </Stack>
          </Grid>
        </Grid>
        <Stack
          width={'100%'}
          height={70}
          alignItems={'center'}
          boxSizing={'border-box'}
          justifyContent={'space-between'}
          direction={'row-reverse'}
          paddingY={2}
          paddingRight={2}
          paddingLeft={1.5}
          marginTop={3}
          bgcolor={theme.customColors.white}
        >
          <Button
            type={'submit'}
            variant={'outlined'}
            disabled={
              isLoadingFee || isLoadingAccountBalances || !fee || isEmpty(balanceByAddressMap)
            }
          >
            Submit
          </Button>
          <Button variant={'outlined-cancel'}>Cancel</Button>
        </Stack>
      </form>
    </Stack>
  )
}

export default Transfer
