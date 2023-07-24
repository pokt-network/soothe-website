'use client'

import React from 'react'
import Stack from '@mui/material/Stack'
import { Theme, useTheme } from '@mui/material'
import { calculateHeight } from '@/utils'
import { AppBarHeight, PaddingBottomContent, PaddingTopContent } from '@/constants'

const paddingX = { xs: '30px' }
const minHeight = calculateHeight('100vh', AppBarHeight)

interface BodyContainerProps {
  children: React.ReactNode
}

const BodyContainer: React.FC<BodyContainerProps> = ({ children }) => {
  const theme: Theme = useTheme()
  return (
    <Stack
      paddingX={paddingX}
      pt={PaddingTopContent}
      pb={PaddingBottomContent}
      bgcolor={theme.customColors.dark5}
      minHeight={minHeight}
      boxSizing={'border-box'}
    >
      {children}
    </Stack>
  )
}

export default BodyContainer
