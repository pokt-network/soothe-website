import React from 'react'
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { DataByChain, SupportedChains } from '@/constants/supportedChains'

type AssetSelectProps = TextFieldProps & {
  chains?: SupportedChains[]
}

const AssetSelect: React.FC<AssetSelectProps> = ({
  chains = Object.values(SupportedChains),
  ...props
}) => {
  return (
    <TextField
      select
      fullWidth
      label={'Asset'}
      size={'small'}
      sx={{
        '& .MuiInputBase-root': {
          height: 40,
          maxHeight: 40,
        },
        '& fieldset': {
          height: 40,
        },
      }}
      {...props}
    >
      {chains.map((chain) => {
        const { icon: Icon, label } = DataByChain[chain]
        return (
          <MenuItem key={chain} value={chain}>
            <Stack spacing={'10px'} direction={'row'} alignItems={'center'}>
              <Stack
                sx={{
                  width: 20,
                  height: 20,
                  '& path': {
                    transform: 'scale(0.67)',
                  },
                }}
              >
                <Icon />
              </Stack>
              <span> {label.toUpperCase()}</span>
            </Stack>
          </MenuItem>
        )
      })}
    </TextField>
  )
}

export default AssetSelect
