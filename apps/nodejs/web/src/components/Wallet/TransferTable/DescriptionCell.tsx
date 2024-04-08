import React, { useMemo } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { roundAndSeparate } from '@/utils'
import { Moment } from 'moment-timezone'
import { useAppSelector } from '@/hooks/redux'
import { Skeleton } from '@mui/material'
import { SupportedChains } from '@/constants/supportedChains'

interface ValueTextProps {
  isLoading?: boolean
  children: React.ReactNode
}

const ValueText: React.FC<ValueTextProps> = ({ children, isLoading }) => {
  return isLoading ? (
    <Skeleton width={'80%'} height={21} />
  ) : (
    <Typography textOverflow={'ellipsis'} whiteSpace={'nowrap'} overflow={'hidden'}>
      {children}
    </Typography>
  )
}

interface DescriptionCellProps {
  isLoading?: boolean
  isTransfer?: boolean
  externalWallet?: string
  height?: number
  hash?: string
  purpose?: string
  block_time?: Moment
  chain: SupportedChains
}

const DescriptionCell: React.FC<DescriptionCellProps> = ({
  isLoading,
  isTransfer,
  externalWallet,
  height,
  block_time,
  hash,
  chain,
  purpose,
}) => {
  const accountsMap: Record<string, string> = useAppSelector((state) => state.account.accountsMap)
  const contactsMap = useAppSelector((state) => state.contact.walletsByChainMap[chain])

  const purposes = useAppSelector((state) => state.purpose.purposes)

  const purposesMap = useMemo(() => {
    return purposes.reduce((acc, item) => ({ ...acc, [item._id]: item }), {})
  }, [purposes])

  const loading = isLoading || false

  const externalWalletText = useMemo(() => {
    if (contactsMap[externalWallet]) {
      const { alias, name } = contactsMap[externalWallet]
      const lastCharacters = externalWallet.substring(externalWallet.length - 10)

      return `${name} (${alias ? alias : `...${lastCharacters}`})`
    } else if (accountsMap[externalWallet]) {
      const lastCharacters = externalWallet.substring(externalWallet.length - 10)
      return `${accountsMap[externalWallet]} (...${lastCharacters})`
    }

    return externalWallet
  }, [contactsMap, externalWallet, accountsMap])

  return (
    <Stack spacing={'5px'} sx={{ '*': { fontSize: '16px!important' } }} width={'100%'}>
      <Stack direction={'row'} spacing={'15px'} width={'100%'}>
        <Stack direction={'row'} spacing={'10px'} width={isLoading ? '300px' : 'unset'}>
          <Typography fontWeight={600}>{isTransfer ? 'Transfer to' : 'Deposit from'}:</Typography>
          <ValueText isLoading={loading}>{externalWalletText}</ValueText>
        </Stack>

        <Stack direction={'row'} flexGrow={1} spacing={'10px'}>
          <Typography fontWeight={600}>Purpose:</Typography>
          <ValueText isLoading={loading}>{purposesMap[purpose]?.name || 'N/A'}</ValueText>
        </Stack>
      </Stack>

      <Stack direction={'row'} spacing={'15px'} width={'100%'} maxWidth={'100%'}>
        <Stack direction={'row'} spacing={'10px'} width={'150px'}>
          <Typography fontWeight={600}>Block:</Typography>
          <ValueText isLoading={loading}>{roundAndSeparate(height!)}</ValueText>
        </Stack>

        <Stack direction={'row'} spacing={'10px'} width={'100px'}>
          <Typography fontWeight={600}>Time:</Typography>
          <ValueText isLoading={loading}>{block_time?.format('HH:mm')}</ValueText>
        </Stack>

        <Stack direction={'row'} spacing={'10px'} width={'calc(100% - 150px - 100px)'}>
          <Typography fontWeight={600}>Hash:</Typography>
          <ValueText isLoading={loading}>{hash}</ValueText>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default DescriptionCell
