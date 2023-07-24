'use client'

import Stack from '@mui/material/Stack'
import styled from '@mui/system/styled'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import React, { useCallback, useState } from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import CircularAddIcon from '@soothe/ui/src/assets/icons/add_circular.svg'
import { labelByChainMap, SupportedChains } from '@/constants/supportedChains'
import CreateUpdateDialog from '@/components/Account/CreateUpdateDialog'
import SearchTextField from '@/components/common/SearchTextField'

const StyledTextField = styled(TextField)<TextFieldProps>(() => ({
  minWidth: 280,
  maxWidth: 280,
  '*': {
    fontSize: 16,
    letterSpacing: '0.5px',
  },
}))

type AllAndSupportedChains = SupportedChains | 'all'

interface HeaderProps {
  selectedAccounts: AllAndSupportedChains
  onChangeSelectedAccounts: (newSelection: string) => void
  chainsWithAccounts: SupportedChains[]
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  searchText: string
  onClearSearch: () => void
}

const Header: React.FC<HeaderProps> = ({
  selectedAccounts,
  onChangeSelectedAccounts,
  chainsWithAccounts,
  onSearchChange,
  searchText,
  onClearSearch,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const toggleShowAddDialog = useCallback(() => {
    setShowAddDialog((prevState) => !prevState)
  }, [])

  const onChangeSelectValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeSelectedAccounts(event.target.value)
    },
    [onChangeSelectedAccounts]
  )

  return (
    <>
      <CreateUpdateDialog open={showAddDialog} onClose={toggleShowAddDialog} />
      <Stack
        height={40}
        direction={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        marginBottom={'20px'}
      >
        <Stack direction={'row'} width={300} spacing={'15px'} alignItems={'center'}>
          <Typography variant={'h6'} letterSpacing={'0.5px'}>
            Showing
          </Typography>
          <StyledTextField
            select
            value={selectedAccounts}
            onChange={onChangeSelectValue}
            size={'small'}
            fullWidth
          >
            <MenuItem value={'all'}>All Accounts</MenuItem>
            {chainsWithAccounts.map((chain) => (
              <MenuItem key={chain} value={chain}>
                {labelByChainMap[chain]} Accounts
              </MenuItem>
            ))}
          </StyledTextField>
        </Stack>
        <Stack direction={'row'} alignItems={'center'} spacing={0.5}>
          <SearchTextField
            placeholder={'Search Accounts'}
            sx={{ width: 300 }}
            variant={'standard'}
            value={searchText}
            onChange={onSearchChange}
            onClear={onClearSearch}
          />
          <Button sx={{ textTransform: 'none' }} onClick={toggleShowAddDialog}>
            <CircularAddIcon style={{ marginRight: '5px' }} /> Add Account
          </Button>
        </Stack>
      </Stack>
    </>
  )
}

export default Header
