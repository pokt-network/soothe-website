import type { TransferFormValues } from '@/components/Transfer/TransferForm'
import type { SuggestedGasFee } from '@/types'
import { roundAndSeparate } from '@/utils'
import Stack from '@mui/material/Stack'
import Popover from '@mui/material/Popover'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import { useTransferContext } from '@/context/TransferContext'
import { SupportedChains } from '@/constants/supportedChains'

interface Option {
  speed: 'low' | 'medium' | 'high'
  maxFee: string
}

function FeeSpeedSelect() {
  const theme = useTheme()
  const { control } = useFormContext<TransferFormValues>()
  const { fee, fromAvailableBalance, feeFetchStatus, getNetworkFee } = useTransferContext()

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      setPopoverWidth(containerRef.current.getBoundingClientRect().width)
    }
  }, [fee, feeFetchStatus])

  const measuredRef = (node: HTMLDivElement) => {
    if (node) {
      containerRef.current = node
      setPopoverWidth(node.getBoundingClientRect().width)
    }
  }

  const onOpenPopover = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const onClosePopover = () => {
    setAnchorEl(null)
  }

  const ethFee = fee as SuggestedGasFee

  const options: Option[] = [
    {
      speed: 'low',
      maxFee: ethFee?.low?.amount,
    },
    {
      speed: 'medium',
      maxFee: ethFee?.medium?.amount,
    },
    {
      speed: 'high',
      maxFee: ethFee?.high?.amount,
    },
  ]

  return (
    <Controller
      control={control}
      name={'feeSpeedSelected'}
      rules={{
        deps: ['transfer_from'],
      }}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        if (feeFetchStatus === 'loading' && !fee) {
          return <Skeleton variant={'rectangular'} width={150} height={14} />
        }

        if (feeFetchStatus === 'error') {
          return (
            <Typography variant={'body2'} color={theme.customColors.red}>
              Error getting fee.{' '}
              <span
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={getNetworkFee}
              >
                Retry
              </span>
            </Typography>
          )
        }
        return (
          <>
            <Stack alignItems={'flex-end'} maxWidth={280} marginLeft={0.5}>
              <Stack
                ref={measuredRef}
                direction={'row'}
                height={20}
                width={'min-content'}
                alignItems={'center'}
                borderRadius={'4px'}
                sx={{
                  cursor: 'pointer',
                  ...(!!anchorEl && {
                    borderBottom: 'none',
                    borderBottomLeftRadius: '0px',
                    borderBottomRightRadius: '0px',
                  }),
                  '& svg': {
                    marginLeft: -0.5,
                    marginTop: -0.1,
                    transform: { xs: 'scale(0.7)', md: 'scale(0.8)' },
                  },
                  '& path': {
                    fill: theme.customColors.dark75,
                  },
                }}
                justifyContent={'space-between'}
                onClick={onOpenPopover}
              >
                <Typography
                  variant={'body2'}
                  whiteSpace={'nowrap'}
                  textOverflow={'ellipsis'}
                  overflow={'hidden'}
                  maxWidth={270}
                >
                  {ethFee?.[value]?.amount} ETH
                </Typography>
                <ArrowDropDown sx={{ fontSize: 14 }} />
              </Stack>
              {error && feeFetchStatus === 'fetched' && (
                <Typography
                  fontSize={10}
                  color={theme.customColors.red}
                  textAlign={'right'}
                  className={'error'}
                >
                  {error.message}
                </Typography>
              )}
            </Stack>
            <Popover
              open={!!anchorEl && feeFetchStatus === 'fetched'}
              anchorEl={anchorEl}
              onClose={onClosePopover}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 0,
              }}
              transitionDuration={200}
              transformOrigin={{ vertical: 'top', horizontal: 1 }}
              PaperProps={{
                sx: {
                  marginTop: 0.3,
                  maxHeight: options.length === 4 ? 160 : 126,
                  height: options.length === 4 ? 160 : 126,
                  paddingX: 0,
                  marginLeft: -1,
                  width: popoverWidth ? popoverWidth + 10 : 100,
                  boxShadow:
                    '0px 5px 0px -10px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.02), 0px 10px 30px -2px rgba(0,0,0,0.4)',
                  borderBottomLeftRadius: '4px',
                  borderBottomRightRadius: '4px',
                  borderTop: 'none!important',
                },
              }}
            >
              {options.map((option) => (
                <Stack
                  key={option.speed}
                  justifyContent={'center'}
                  sx={{
                    cursor: 'pointer',
                    paddingLeft: 1,
                    paddingRight: 0.5,
                    minHeight: `40px !important`,
                    backgroundColor:
                      value === option.speed ? `${theme.customColors.dark5}!important` : undefined,
                    ':hover': {
                      backgroundColor: `${theme.customColors.dark15}`,
                    },
                  }}
                  onClick={() => {
                    onChange(option.speed)
                    onClosePopover()
                  }}
                >
                  <Typography
                    variant={'body2'}
                    sx={{
                      color: theme.customColors.dark90,
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {option.maxFee} ETH
                  </Typography>
                  <Typography variant={'body2'} color={theme.customColors.dark75}>
                    Est. {ethFee[option.speed].maxWaitTimeEstimate / 1e3} secs
                  </Typography>
                </Stack>
              ))}
            </Popover>
          </>
        )
      }}
    />
  )
}

export default function FeeInput() {
  const { fee } = useTransferContext()
  const { watch } = useFormContext<TransferFormValues>()
  const selectedChain = watch('chain')

  if (!fee) {
    if (selectedChain === SupportedChains.pocket) {
      return (
        <Typography variant={'body2'} sx={{ marginLeft: '5px' }} lineHeight={'20px'}>
          -
        </Typography>
      )
    } else {
      return (
        <Typography
          variant={'body2'}
          color={'error'}
          lineHeight={'20px'}
          sx={{ marginLeft: '5px' }}
        >
          You must select Transfer From and Transfer To
        </Typography>
      )
    }
  }

  if (typeof fee === 'number') {
    return (
      <Typography variant={'body2'} sx={{ marginLeft: '5px' }} lineHeight={'20px'}>
        {roundAndSeparate(fee, 6)}
      </Typography>
    )
  } else if (typeof fee === 'object') {
    return <FeeSpeedSelect />
  }

  return null
}
