import styled from '@mui/system/styled'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import React from 'react'
import IconButton from '@mui/material/IconButton'

type SearchTextFieldProps = TextFieldProps & {
  onClear?: () => void
}

const StyledTextField = styled(TextField)<TextFieldProps>(() => ({
  width: 300,
  height: 40,
  '*': {
    fontSize: 16,
    letterSpacing: '0.5px',
  },
  '& .MuiInputBase-root, input': {
    height: 40,

    paddingLeft: '5px!important',
    paddingRight: '5px!important',
  },
}))

const SearchTextField: React.FC<SearchTextFieldProps> = ({ onClear, ...props }) => {
  return (
    <StyledTextField
      InputProps={{
        startAdornment: <SearchIcon sx={{ fontSize: '25px!important' }} />,
        endAdornment:
          props.value && onClear ? (
            <IconButton onClick={onClear}>
              <CloseRoundedIcon sx={{ fontSize: '25px!important' }} />
            </IconButton>
          ) : null,
      }}
      {...props}
    />
  )
}

export default SearchTextField
