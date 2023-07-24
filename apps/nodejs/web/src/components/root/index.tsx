'use client'

import React from 'react'
import { store } from '@/config/store'
import { Provider } from 'react-redux'
import { SnackbarProvider } from 'notistack'
import { LicenseInfo } from '@mui/x-license-pro'
import ThemeProvider from '@soothe/ui/src/theme'

LicenseInfo.setLicenseKey(
  '763a13a4ba1ef251030d4b624dde24c8T1JERVI6MzcyMzcsRVhQSVJZPTE2NzU1NTEwMjEwMDAsS0VZVkVSU0lPTj0x'
)

interface RootProps {
  children: React.ReactNode
}

const Root: React.FC<RootProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default Root
