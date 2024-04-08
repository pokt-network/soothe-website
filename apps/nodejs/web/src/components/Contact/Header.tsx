'use client'

import React from 'react'
import Stack from '@mui/material/Stack'
import styled from '@mui/system/styled'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import SearchTextField from '@/components/common/SearchTextField'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import CircularAddIcon from '@soothe/ui/src/assets/icons/add_circular.svg'

const StyledTextField = styled(TextField)<TextFieldProps>(() => ({
  minWidth: 280,
  maxWidth: 280,
  '*': {
    fontSize: 16,
    letterSpacing: '0.5px',
  },
}))

interface HeaderProps {
  searchText: string
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  toggleShowCreateContactDialog: () => void
}

const Header = ({
  searchText,
  onClearSearch,
  onSearchChange,
  toggleShowCreateContactDialog,
}: HeaderProps) => {
  return (
    <Stack
      height={40}
      direction={'row'}
      alignItems={'center'}
      justifyContent={'space-between'}
      marginBottom={'20px'}
      marginTop={-1}
    >
      <Stack direction={'row'} width={300} spacing={'15px'} alignItems={'center'}>
        <Typography variant={'h6'} letterSpacing={'0.5px'}>
          Showing
        </Typography>
        <StyledTextField select value={'all'} size={'small'} fullWidth>
          <MenuItem value={'all'}>All Contacts</MenuItem>
        </StyledTextField>
      </Stack>
      <Stack direction={'row'} alignItems={'center'} spacing={0.5}>
        <SearchTextField
          autoComplete={'off'}
          placeholder={'Search Contacts'}
          sx={{ width: 300 }}
          variant={'standard'}
          value={searchText}
          onChange={onSearchChange}
          onClear={onClearSearch}
        />
        <Button sx={{ textTransform: 'none' }} onClick={toggleShowCreateContactDialog}>
          <CircularAddIcon style={{ marginRight: '5px' }} /> Add Contact
        </Button>
      </Stack>
    </Stack>
  )
}

export default Header
