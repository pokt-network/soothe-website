'use client'

import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import React, { useCallback, useMemo } from 'react'
import { type Theme, useTheme } from '@mui/material'
import { DataGridPro, GridColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import { DataByChain, labelByChain, SupportedChains } from '@/constants/supportedChains'
import { useFetchPricesQuery } from '@/features/cryptoPrice/slice'
import { roundAndSeparate } from '@/utils'

interface Row {
  label: string
  chain: SupportedChains
  currentPrice: number
  amountChanged24h: number
  percentChange24h: number
}

const CryptoPrices = () => {
  const theme: Theme = useTheme()
  const { data: dataPrices, isLoading: isLoadingPrices } = useFetchPricesQuery(undefined, {
    pollingInterval: 6e4,
  })

  const rows: Row[] = useMemo(() => {
    return labelByChain
      .map((item) => {
        const price: number = dataPrices?.[item.value]?.price || 0
        const percentChange24h: number = dataPrices?.[item.value]?.percent_change_24h || 0

        return {
          label: item.label,
          chain: item.value,
          currentPrice: price,
          amountChanged24h: price * (percentChange24h / 100),
          percentChange24h: percentChange24h,
        }
      })
      .sort((a, b) => b.currentPrice - a.currentPrice)
  }, [dataPrices])

  const chainRenderer = useCallback(
    (chain: SupportedChains) => {
      const { icon: Icon, label, code } = DataByChain[chain]
      return (
        <Stack height={45} direction={'row'} alignItems={'center'} spacing={1}>
          <Icon />
          <Stack>
            <Typography fontWeight={700} color={theme.customColors.primary500} variant={'h6'}>
              {label}
            </Typography>
            <Typography color={theme.customColors.dark75} variant={'body2'}>
              {code} USD
            </Typography>
          </Stack>
        </Stack>
      )
    },
    [theme]
  )

  const cellRenderer = useCallback(
    (params: GridRenderCellParams<Row>) => {
      if (params.field === 'chain') {
        return chainRenderer(params.row[params.field])
      }

      if (isLoadingPrices) {
        return <Skeleton width={'90%'} height={30} />
      }

      const value: number = params.row[params.field]

      let roundedValue: string

      if (value < 1 && value > -1) {
        roundedValue = roundAndSeparate(value, 4)
      } else {
        roundedValue = roundAndSeparate(value, 2)
      }

      if (params.field === 'percentChange24h') {
        roundedValue += '%'
      }

      return (
        <span
          style={{
            color:
              params.field === 'currentPrice'
                ? theme.customColors.dark100
                : value > 0
                ? theme.customColors.dark_green
                : theme.customColors.red,
          }}
        >
          {roundedValue}
        </span>
      )
    },
    [isLoadingPrices, chainRenderer, theme]
  )

  const columns: GridColDef<Row>[] = useMemo(
    () => [
      {
        field: 'chain',
        flex: 1,
        headerName: 'Chain',
        renderCell: cellRenderer,
      },
      {
        field: 'currentPrice',
        flex: 1,
        headerName: 'Current Price',
        align: 'right',
        headerAlign: 'right',
        renderCell: cellRenderer,
      },
      {
        field: 'amountChanged24h',
        flex: 1,
        headerName: 'Change',
        align: 'right',
        headerAlign: 'right',
        renderCell: cellRenderer,
      },
      {
        field: 'percentChange24h',
        flex: 1,
        headerName: '% Change',
        align: 'right',
        headerAlign: 'right',
        renderCell: cellRenderer,
      },
    ],
    [cellRenderer]
  )

  return (
    <Stack
      spacing={'15px'}
      padding={'10px'}
      border={`1px solid ${theme.customColors.dark50}`}
      boxShadow={'0px 0px 4px rgba(0, 0, 0, 0.2)'}
      borderRadius={'2px'}
      paddingY={1.5}
      pl={3}
      pr={2}
      bgcolor={theme.customColors.white}
      height={'100%'}
    >
      <Stack direction={'row'} height={40} alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant={'h5'} fontWeight={600} letterSpacing={'0.5px'}>
          Cryptocurrencies
        </Typography>
        <Typography variant={'body2'} sx={{ '*': { color: theme.customColors.dark100 } }}>
          by{' '}
          <a href={'https://coinmarketcap.com/'} target={'_blank'}>
            CoinMarketCap
          </a>
        </Typography>
      </Stack>
      <DataGridPro
        columns={columns}
        rows={rows}
        getRowId={(row) => row.chain}
        hideFooterPagination={true}
        hideFooter={true}
        autoHeight={true}
        rowHeight={60}
        headerHeight={35}
        sx={{
          '& .MuiDataGrid-cell': {
            fontWeight: 600,
          },
          '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
            paddingLeft: 0,
            paddingRight: 0,
          },
        }}
      />
    </Stack>
  )
}

export default CryptoPrices
