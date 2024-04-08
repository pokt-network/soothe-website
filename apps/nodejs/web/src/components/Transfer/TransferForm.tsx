'use client'
import type { Account } from '@/types'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { useRouter } from 'next/navigation'
import { useTheme } from '@mui/material/styles'
import { FormProvider, useForm } from 'react-hook-form'
import Stack, { StackProps } from '@mui/material/Stack'
import React, { useEffect, useMemo, useState } from 'react'
import { NetworksByChains, SupportedChains } from '@/constants/supportedChains'
import { useGetBalances, useGetTransferFeeByChain } from '@/hooks/chains'
import FormInputs from '@/components/Transfer/FormInputs/FormInputs'
import TransferSummary from '@/components/Transfer/TransferSummary'
import TransferContextProvider from '@/context/TransferContext'
import SendToWallet from '@/components/Transfer/SendToWallet'
import { useAppSelector } from '@/hooks/redux'

export interface TransferFormValues {
  chain: string
  network: string
  transfer_from: string
  transfer_to: string
  transfer_amount: string
  purpose: string
  adding_new_purpose: boolean
  new_purpose_name?: string
  recipient_message: string
  internal_memo: string
  new_contact_name?: string
  new_contact_address?: string
  from_account_passed?: boolean
  feeSpeedSelected?: 'low' | 'medium' | 'high'
}

interface TransferFormProps {
  summaryIsStep?: boolean
  containerProps?: StackProps<'form'>
  buttonsContainerProps?: StackProps
  onCancel?: () => void
  onDone?: () => void
  fromAccount?: Account
}

const defaultValues: TransferFormValues = {
  chain: null,
  network: null,
  transfer_from: null,
  transfer_to: null,
  transfer_amount: '',
  purpose: null,
  internal_memo: '',
  recipient_message: '',
  new_purpose_name: '',
  adding_new_purpose: false,
  from_account_passed: false,
  feeSpeedSelected: 'medium',
}

export default function TransferForm({
  onCancel,
  summaryIsStep,
  containerProps,
  buttonsContainerProps,
  fromAccount,
  onDone,
}: TransferFormProps) {
  const theme = useTheme()
  const router = useRouter()
  const [status, setStatus] = useState<
    'form' | 'summary' | 'wallet' | 'loading' | 'error' | 'user_rejected'
  >('form')
  const purposes = useAppSelector((state) => state.purpose.purposes)

  const { accountsByChain } = useAppSelector((state) => state.account)
  const methods = useForm<TransferFormValues>({
    defaultValues: {
      ...defaultValues,
      chain: fromAccount?.chain || null,
      transfer_from: fromAccount?.address || null,
      purpose: purposes?.[0]?._id || '',
      from_account_passed: !!fromAccount,
    },
  })

  const { watch, reset, setValue, getValues, handleSubmit } = methods

  useEffect(() => {
    const purpose = getValues('purpose')

    if (!purpose && purposes.length) {
      setValue('purpose', purposes[0]._id)
    }
  }, [purposes])

  const [selectedChain, transferFrom, transferTo] = watch([
    'chain',
    'transfer_from',

    'transfer_to',
  ]) as [SupportedChains, string, string]

  useEffect(() => {
    let network = ''
    if (NetworksByChains[selectedChain]?.length === 1) {
      network = NetworksByChains[selectedChain][0].value
    }

    setValue('network', network)
    setValue('transfer_from', fromAccount?.address || null)
    setValue('transfer_to', '')
    setValue('new_contact_name', '')
    setValue('new_contact_address', '')
    // eslint-disable-next-line
  }, [selectedChain])

  useEffect(() => {
    if (fromAccount) {
      reset({
        ...getValues(),
        chain: fromAccount.chain,
        transfer_from: fromAccount.address,
        from_account_passed: true,
      })
    } else {
      setValue('from_account_passed', false)
    }
  }, [fromAccount])

  useEffect(() => {
    setValue('transfer_amount', '')
    const transferTo = getValues('transfer_to')

    if (transferTo === transferFrom) {
      setValue('transfer_to', '')
    }
    // eslint-disable-next-line
  }, [transferFrom])

  const {
    isLoading: isLoadingFee,
    fee,
    getTransferFeeOfChain,
    error: feeError,
  } = useGetTransferFeeByChain(selectedChain, false)

  const {
    balanceByAddress: accountBalances,
    getBalances: getAccountBalances,
    isLoading: isLoadingAccountBalances,
    error: balanceError,
  } = useGetBalances()

  const getBalances = () => {
    if (selectedChain && accountsByChain[selectedChain]?.length) {
      getAccountBalances(
        accountsByChain[selectedChain].map((item) => item.address),
        selectedChain
      )
    }
  }

  useEffect(() => {
    getBalances()
    // eslint-disable-next-line
  }, [selectedChain])

  const getTransferFee = () => {
    if (selectedChain === SupportedChains.ethereum && transferTo && transferFrom) {
      getTransferFeeOfChain({
        from: transferFrom,
        to: transferTo,
      })
    } else if (selectedChain === SupportedChains.pocket) {
      getTransferFeeOfChain()
    }
  }

  useEffect(() => {
    getTransferFee()
  }, [selectedChain, transferFrom, transferTo])

  useEffect(() => {
    let interval: NodeJS.Timer

    if (
      status === 'form' &&
      selectedChain === SupportedChains.ethereum &&
      transferTo &&
      transferFrom
    ) {
      interval = setInterval(getTransferFee, 3e4)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [selectedChain, transferFrom, transferTo, status])

  const onSubmit = (data: TransferFormValues) => {
    if (status === 'form') {
      setStatus(summaryIsStep ? 'summary' : 'wallet')
    } else if (status === 'summary') {
      setStatus('wallet')
    }
  }

  const onCancelOrBack = () => {
    if (status === 'form') {
      if (onCancel) {
        onCancel()
      } else {
        router.push('/')
      }
    } else if (status === 'summary') {
      setStatus('form')
    }
  }

  const balanceByAddressMap: Record<string, number> = useMemo(() => {
    if (isLoadingAccountBalances || !selectedChain) return {} as Record<string, number>

    return accountBalances.reduce<Record<string, number>>(
      (acc, item) => ({ ...acc, [item.address]: item.balance }),
      {}
    )
  }, [selectedChain, isLoadingAccountBalances, accountBalances])

  let content: React.ReactNode

  switch (status) {
    case 'form': {
      if (summaryIsStep) {
        content = (
          <Stack width={1}>
            <FormInputs />
          </Stack>
        )
      } else {
        content = (
          <Grid container>
            <Grid item xs={12} lg={8}>
              <FormInputs />
            </Grid>
            <Grid
              item
              xs={12}
              lg={4}
              sx={{ display: 'flex', flexGrow: 1 }}
              paddingLeft={{ lg: 3 }}
              marginTop={{ xs: 2, lg: 0 }}
            >
              <TransferSummary />
            </Grid>
          </Grid>
        )
      }
      break
    }
    case 'summary': {
      content = (
        <Stack height={1} width={1} alignItems={'center'} justifyContent={'center'}>
          <TransferSummary />
        </Stack>
      )
      break
    }
    case 'wallet': {
      content = (
        <Stack width={1} height={1} paddingBottom={4}>
          <SendToWallet
            onBack={() => setStatus(summaryIsStep ? 'summary' : 'form')}
            onDone={() => {
              if (onDone) {
                onDone()
              } else {
                router.push('/')
              }
            }}
          />
        </Stack>
      )
      break
    }
  }

  const invalidFee = selectedChain === SupportedChains.ethereum && (!transferFrom || !transferTo)

  return (
    <Stack
      border={`1px solid ${theme.customColors.dark50}`}
      boxShadow={'0px 0px 4px rgba(0, 0, 0, 0.2)'}
      borderRadius={'2px'}
      bgcolor={theme.customColors.dark2}
      component={'form'}
      onSubmit={handleSubmit(onSubmit)}
      height={510}
      paddingTop={2}
      paddingX={3}
      {...containerProps}
    >
      <FormProvider {...methods}>
        <TransferContextProvider
          fee={fee}
          getNetworkFee={getTransferFee}
          fromAvailableBalance={balanceByAddressMap[transferFrom]}
          getAvailableBalance={getBalances}
          feeFetchStatus={
            isLoadingFee
              ? 'loading'
              : feeError
              ? 'error'
              : !fee || invalidFee
              ? 'not-fetched'
              : 'fetched'
          }
          balanceFetchStatus={
            isLoadingAccountBalances
              ? 'loading'
              : balanceError
              ? 'error'
              : !accountBalances.length
              ? 'not-fetched'
              : 'fetched'
          }
        >
          {content}
        </TransferContextProvider>
      </FormProvider>
      {(status === 'form' || status === 'summary') && (
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
          {...buttonsContainerProps}
        >
          <Button type={'submit'} variant={'outlined'}>
            {status === 'form' && summaryIsStep ? 'Next' : 'Send to Wallet'}
          </Button>
          <Button variant={'outlined-cancel'} onClick={onCancelOrBack}>
            {summaryIsStep && status === 'summary' ? 'Back' : 'Cancel'}
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
