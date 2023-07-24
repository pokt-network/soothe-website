import type { CircularProgressProps, SxProps } from '@mui/material'
import React from 'react'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

interface LoadFailedProps {
  sxContainerProps?: SxProps
  circularProps?: CircularProgressProps
}

const CircularLoading: React.FC<LoadFailedProps> = (props) => {
  const { sxContainerProps, circularProps } = props

  return (
    <Grid
      container
      height={'100%'}
      width={'100%'}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        ...sxContainerProps,
      }}
    >
      <CircularProgress size={80} {...circularProps} />
    </Grid>
  )
}

export default CircularLoading
