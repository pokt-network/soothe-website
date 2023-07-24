import React from 'react'
import { Open_Sans } from 'next/font/google'
import Workspace from '@/components/Workspace'
import AppBar from '@/components/AppBar'
import Root from '@/components/root'
import BodyContainer from '@/components/root/BodyContainer'

export const metadata = {
  title: 'Soothe',
  description: 'Provisional name',
}

const openSans = Open_Sans({
  weight: ['300', '400', '500', '600', '700'],
  style: 'normal',
  subsets: ['latin'],
})

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={openSans.className}>
      <body style={{ margin: 0 }}>
        <Root>
          <Workspace>
            <AppBar />
            <BodyContainer>{children}</BodyContainer>
          </Workspace>
        </Root>
      </body>
    </html>
  )
}
