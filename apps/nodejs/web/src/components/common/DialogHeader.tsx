'use client'

import { type Theme, useTheme } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogTitle from '@mui/material/DialogTitle'
import CloseIcon from '@mui/icons-material/CloseRounded'

interface DialogHeaderProps {
  children: React.ReactNode
  onClose: () => void
}

const DialogHeader = ({ children, onClose }: DialogHeaderProps) => {
  const theme: Theme = useTheme()
  return (
    <DialogTitle
      sx={{
        backgroundColor: theme.customColors.primary999,
        height: 50,
        paddingY: 0.5,
        paddingLeft: 1.5,
        paddingRight: 0.5,
        borderBottom: `3px solid ${theme.customColors.sky_blue}`,
        boxSizing: 'border-box',
        '*': {
          userSelect: 'none',
        },
      }}
    >
      <Stack
        direction={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        height={'100%'}
      >
        {typeof children === 'string' ? (
          <Typography variant={'h6'} color={theme.customColors.white} fontWeight={700}>
            {children}
          </Typography>
        ) : (
          children
        )}
        <IconButton
          onClick={onClose}
          sx={{
            width: 30,
            height: 30,
            '& path': {
              fill: theme.customColors.white,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
    </DialogTitle>
  )
}

export default DialogHeader
