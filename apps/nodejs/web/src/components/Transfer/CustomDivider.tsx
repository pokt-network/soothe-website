import React from 'react'
import Grid from '@mui/material/Grid'
import Divider, { DividerProps } from '@mui/material/Divider'

export interface CustomDividerProps {
  justXs?: boolean
  sxDividerProps?: DividerProps['sx']
}

const CustomDivider: React.FC<CustomDividerProps> = ({ justXs, sxDividerProps }) => {
  return (
    <Grid item xs={12} display={justXs ? { xs: 'block', sm: 'none' } : 'block'}>
      <Divider
        sx={{
          marginTop: 2,
          marginBottom: 1.5,
          ...sxDividerProps,
        }}
      />
    </Grid>
  )
}
export default CustomDivider
