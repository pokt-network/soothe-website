import React from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { roundAndSeparate } from '@/utils'

interface AmountHelperTextProps {
  accountBalance: number
  transferFee: number
  isLoadingBalance?: boolean
  isLoadingFee?: boolean
  onClickAll: () => void
}

const AmountHelperText: React.FC<AmountHelperTextProps> = ({
  accountBalance,
  onClickAll,
  isLoadingBalance,
  isLoadingFee,
  transferFee,
}) => {
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
          {isLoadingBalance ? (
            <Skeleton width={100} height={20} sx={{ marginLeft: '5px' }} />
          ) : (
            <Typography variant={'body2'} sx={{ marginLeft: '5px' }}>
              {roundAndSeparate(accountBalance, 6)}
            </Typography>
          )}
        </Stack>

        <Stack direction={'row'} alignItems={'center'}>
          <Typography variant={'body2'} fontWeight={600}>
            Fee:
          </Typography>
          {isLoadingFee ? (
            <Skeleton width={50} height={20} sx={{ marginLeft: '5px' }} />
          ) : (
            <Typography variant={'body2'} sx={{ marginLeft: '5px' }}>
              {roundAndSeparate(transferFee, 6, typeof transferFee === 'number' ? '0' : '-')}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Button
        sx={{
          textAlign: 'right',
          paddingX: 0,
          fontWeight: 600,
          fontSize: 12,
          textDecoration: 'underline',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        disabled={!accountBalance}
        onClick={onClickAll}
      >
        Transfer all
      </Button>
    </Stack>
  )
}

export default AmountHelperText
