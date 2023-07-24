import type { SxProps } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import React, { useCallback, useMemo, useState } from 'react'
import useTheme from '@mui/material/styles/useTheme'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface LoadFailedProps {
  onReloadClick?: () => void
  sxContainerProps?: SxProps
  sxTextContainer?: SxProps
  loadText?: string
  showReload?: boolean
  sxLoadText?: SxProps
  sxReloadText?: SxProps
  reloadText?: string
}

const LoadFailed: React.FC<LoadFailedProps> = (props) => {
  const theme: Theme = useTheme()
  const [height, setHeight] = useState(0)
  const {
    onReloadClick,
    sxContainerProps,
    sxTextContainer,
    sxReloadText,
    loadText = 'Load Failed',
    showReload = true,
    sxLoadText,
    reloadText = 'Please Reload',
  } = props

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node != null) {
      setHeight(node.getBoundingClientRect().height)
    }
  }, [])

  const isSmallSize = height <= 90

  const reloadLink = useMemo(() => {
    return (
      showReload && (
        <Link
          onClick={onReloadClick}
          sx={{
            fontSize: theme.typography.body1.fontSize,
            fontWeight: 300,
            fontFamily: theme.typography.fontFamily,
            letterSpacing: 0.5,
            height: 20,
            color: theme.customColors.dark75,
            cursor: 'pointer',
            textAlign: 'left',
            ...sxReloadText,
          }}
        >
          {reloadText}
        </Link>
      )
    )
  }, [showReload, onReloadClick, theme, reloadText, sxReloadText])
  return (
    <Grid
      container
      ref={measuredRef}
      height={'100%'}
      width={'100%'}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        ...sxContainerProps,
      }}
    >
      <Stack
        direction={isSmallSize ? 'row' : 'column'}
        sx={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          width={150}
          height={44}
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={sxTextContainer}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: 0.5,
              height: 24,
              color: theme.customColors.primary500,
              ...sxLoadText,
            }}
          >
            {loadText}
          </Typography>
          {reloadLink}
        </Box>
      </Stack>
    </Grid>
  )
}

export default LoadFailed
