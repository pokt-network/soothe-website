import React, { useCallback, useEffect, useMemo } from 'react'
import { SupportedChains } from '@/constants/supportedChains'
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro'
import { ListTransferItem } from '@/datasource/chains/base'
import { useListTransfers } from '@/hooks/chains'
import { useFetchPricesQuery } from '@/features/cryptoPrice/slice'
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams'
import Stack from '@mui/material/Stack'
import { roundAndSeparate } from '@/utils'
import { Skeleton } from '@mui/material'
import { GridEventListener } from '@mui/x-data-grid'
import DescriptionCell from '@/components/Wallet/TransferTable/DescriptionCell'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import DownloadIcon from '@soothe/ui/src/assets/icons/download.svg'
import CollapseIcon from '@soothe/ui/src/assets/icons/collapse.svg'
import PrintIcon from '@soothe/ui/src/assets/icons/print.svg'

interface TransferTableProps {
  address: string
  chain: SupportedChains
}

interface Row extends ListTransferItem {
  description: string
  value: number
  loading?: boolean
}

type KeyRow = keyof Row
type ValuesType = Row[KeyRow]

const TransferTable: React.FC<TransferTableProps> = ({ address, chain }) => {
  const { listTransfers, isLoading, response, error } = useListTransfers()
  const { items, nextCursorPage, hasNextPage } = response || {}
  const theme = useTheme()

  const { data: dataPrices, isLoading: isLoadingPrices } = useFetchPricesQuery()

  const isLoadingRows = isLoading || (items === null && !error)

  useEffect(() => {
    listTransfers(address, chain)
    // eslint-disable-next-line
  }, [address, chain])

  const cellRenderer = useCallback(
    (params: GridRenderCellParams<ValuesType, Row>) => {
      if (params.row.loading) {
        if (params.field === 'description') {
          return <DescriptionCell isLoading={true} chain={chain} />
        }

        return <Skeleton height={30} width={'80%'} />
      }

      if (params.field === 'block_time') {
        return params.row.block_time.format('MMM DD, YYYY')
      }

      const isTransfer = params.row.type === 'transfer'

      if (params.field === 'type') {
        return (
          <span
            style={{ color: isTransfer ? theme.customColors.red : theme.customColors.dark_green }}
          >
            {(params.value as string).charAt(0).toUpperCase() +
              (params.value as string).substring(1)}
          </span>
        )
      }

      if (params.field === 'amount') {
        return `${isTransfer ? '-' : '+'}${roundAndSeparate(params.value as number, 6)}`
      }

      if (params.field === 'fee') {
        return roundAndSeparate(params.value as number, 6)
      }

      if (params.field === 'value') {
        if (isLoadingPrices) {
          return <Skeleton width={'90%'} height={30} />
        }

        return `$${roundAndSeparate(params.row.amount * (dataPrices[chain].price || 0))}`
      }

      if (params.field === 'description') {
        const externalWallet = isTransfer ? params.row.to_address : params.row.from_address

        return (
          <DescriptionCell
            isTransfer={isTransfer}
            externalWallet={externalWallet}
            height={params.row.height}
            hash={params.row.hash}
            block_time={params.row.block_time}
            chain={chain}
          />
        )
      }
    },
    [isLoadingPrices, chain, dataPrices, theme]
  )

  const columns: GridColDef<Row, ValuesType>[] = useMemo(
    () => [
      {
        field: 'block_time',
        headerName: 'Date',
        renderCell: cellRenderer,
        width: 150,
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1,
        renderCell: cellRenderer,
      },
      {
        field: 'type',
        headerName: 'Type',
        renderCell: cellRenderer,
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 150,
        renderCell: cellRenderer,
        headerAlign: 'right',
        align: 'right',
      },
      {
        field: 'fee',
        headerName: 'Fee',
        renderCell: cellRenderer,
        headerAlign: 'right',
        align: 'right',
      },
      {
        field: 'value',
        width: 150,
        headerName: 'Value',
        renderCell: cellRenderer,
        headerAlign: 'right',
        align: 'right',
      },
    ],
    [cellRenderer]
  )

  const rows = useMemo(() => {
    if (isLoadingRows && !items?.length) {
      return new Array(6).fill(null).map((_, i) => ({ loading: true, hash: `loading_${i}` }))
    }

    if (isLoadingRows) {
      return [...items, { loading: true, hash: 'loading_1' }, { loading: true, hash: 'loading_2' }]
    }

    return items
  }, [items, isLoadingRows])

  const onRowsScrollEnd: GridEventListener<'rowsScrollEnd'> = useCallback(
    (params) => {
      if (params.virtualRowsCount && hasNextPage && nextCursorPage && !isLoadingRows) {
        listTransfers(address, chain, nextCursorPage)
      }
    },
    [hasNextPage, nextCursorPage, listTransfers, address, chain, isLoadingRows]
  )

  return (
    <Stack
      flexGrow={1}
      bgcolor={theme.customColors.white}
      border={`1px solid ${theme.customColors.dark25}`}
      boxShadow={'0px 0px 4px rgba(0, 0, 0, 0.2)'}
      marginTop={2}
      minHeight={500}
    >
      <Stack
        height={60}
        justifyContent={'center'}
        paddingX={2}
        borderBottom={`1px solid ${theme.customColors.dark25}`}
      >
        <Typography variant={'h5'} fontWeight={600} letterSpacing={'0.5px'}>
          Account Activity
        </Typography>
      </Stack>
      <Stack
        height={60}
        borderBottom={`1px solid ${theme.customColors.dark25}`}
        bgcolor={theme.customColors.dark2}
        direction={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        pl={2}
        py={1.5}
        pr={1}
        boxSizing={'border-box'}
      >
        <Stack direction={'row'} spacing={1.5} alignItems={'center'}>
          <Typography variant={'h6'} color={theme.customColors.dark75} letterSpacing={'0.5px'}>
            Showing
          </Typography>
          <TextField select value={'all'} sx={{ width: 250 }}>
            <MenuItem value={'all'}>All Transactions</MenuItem>
          </TextField>
          <Typography
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}
            color={theme.customColors.primary500}
            letterSpacing={'0.5px'}
            variant={'h6'}
          >
            Search
          </Typography>
        </Stack>
        <Stack direction={'row'} alignItems={'center'}>
          <IconButton>
            <PrintIcon />
          </IconButton>
          <IconButton>
            <DownloadIcon />
          </IconButton>
          <IconButton>
            <CollapseIcon />
          </IconButton>
        </Stack>
      </Stack>
      <DataGridPro
        columns={columns}
        rows={rows || []}
        getRowId={(item) => item.hash}
        rowHeight={100}
        rowThreshold={0}
        onRowsScrollEnd={onRowsScrollEnd}
        hideFooter={true}
        sx={{
          '& .MuiDataGrid-cell': {
            paddingTop: 2.5,
            alignItems: 'flex-start',
          },
          // '& .MuiDataGrid-cell[data-field="block_time"]': {
          //   marginLeft: 1,
          // },
          // '& .MuiDataGrid-cell[data-field="value"]': {
          //   marginLeft: -2,
          // },
        }}
      />
    </Stack>
  )
}

export default TransferTable
