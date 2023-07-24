'use client'

import Stack from '@mui/material/Stack'
import { calculateHeight } from '@/utils'
import { AppBarHeight, PaddingBottomContent, PaddingTopContent } from '@/constants'
import CryptoPrices from '@/components/Home/CryptoPrices'
import Accounts from '@/components/Account'

const minHeight = calculateHeight('100vh', AppBarHeight, PaddingTopContent, PaddingBottomContent, {
  xs: '(-10px)',
})

const Home = () => {
  return (
    <Stack direction={'row'} spacing={3} marginTop={-1}>
      <Stack flexGrow={1} height={minHeight}>
        <Accounts />
      </Stack>
      <Stack width={600} height={minHeight}>
        <CryptoPrices />
      </Stack>
    </Stack>
  )
}

export default Home
