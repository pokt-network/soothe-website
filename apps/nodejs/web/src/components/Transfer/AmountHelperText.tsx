import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import React from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { useFormContext } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import { roundAndSeparate } from '@/utils'
import { useTransferContext } from '@/context/TransferContext'
import FeeInput from '@/components/Transfer/FormInputs/FeeInput'

export default function AmountHelperText() {
  const { fromAvailableBalance, feeSelected, balanceFetchStatus, feeFetchStatus } =
    useTransferContext()
  const { setValue, clearErrors } = useFormContext<TransferFormValues>()

  const onClickAll = () => {
    if (feeSelected && fromAvailableBalance) {
      const transferFromBalance = (fromAvailableBalance || 0) - feeSelected

      if (transferFromBalance) {
        setValue('transfer_amount', (transferFromBalance || '').toString())
        clearErrors('transfer_amount')
      }
    }
  }

  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      justifyContent={'space-between'}
      height={30}
      width={'100%'}
    >
      <Stack>
        <Stack direction={'row'} alignItems={'center'}>
          <Typography variant={'body2'} fontWeight={600}>
            Available:
          </Typography>
          {balanceFetchStatus === 'loading' ? (
            <Skeleton width={100} height={20} sx={{ marginLeft: '5px' }} />
          ) : (
            <Typography variant={'body2'} sx={{ marginLeft: '5px' }}>
              {roundAndSeparate(fromAvailableBalance, 18)}
            </Typography>
          )}
        </Stack>

        <Stack direction={'row'} alignItems={'center'}>
          <Typography variant={'body2'} fontWeight={600}>
            Fee:
          </Typography>
          {feeFetchStatus === 'loading' && !feeSelected ? (
            <Skeleton width={50} height={20} sx={{ marginLeft: '5px' }} />
          ) : (
            <FeeInput />
          )}
        </Stack>
      </Stack>

      <Button
        sx={{
          paddingX: 0,
          fontSize: 12,
          fontWeight: 600,
          textAlign: 'right',
          textDecoration: 'underline',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        disabled={!fromAvailableBalance || !feeSelected || feeFetchStatus === 'not-fetched'}
        onClick={onClickAll}
      >
        Transfer all
      </Button>
    </Stack>
  )
}
