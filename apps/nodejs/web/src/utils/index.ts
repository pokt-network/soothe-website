import { UPOKT_TO_POKT_DEM, WEI_TO_ETHER_DEM } from '@/constants'
import { SupportedChains } from '@/constants/supportedChains'
import { isAddress as isEthereumAddress } from 'web3-utils'

export const isHex = (str: string) => {
  return str.match(/^[0-9a-fA-F]+$/g)
}

export const isValidPoktAddress = (address: string) => isHex(address) && address.length === 40

export const checkIsValidAddress = (address: string, chain: SupportedChains): boolean => {
  switch (chain) {
    case SupportedChains.ethereum:
      return isEthereumAddress(address)
    case SupportedChains.pocket:
      return isValidPoktAddress(address)
  }
}

export const roundAndSeparate = (value: number, decimalPlaces = 2, defaultValue = '-') => {
  return value
    ? parseFloat(value.toFixed(decimalPlaces)).toLocaleString([], {
        maximumFractionDigits: decimalPlaces,
      })
    : defaultValue
}

export const returnIfFinite = (value: number) => {
  if (isFinite(value) && typeof value === 'number') {
    return value
  } else {
    return 0
  }
}

export const convertToPoktNumber = (value: number) => {
  return returnIfFinite(value / UPOKT_TO_POKT_DEM)
}

export const convertFromWeiToEtherNumber = (value: number) => {
  return returnIfFinite(value / WEI_TO_ETHER_DEM)
}

export const convertToPoktText = (value: number, decimalPlaces = 2, defaultValue = '0') => {
  return roundAndSeparate(returnIfFinite(value / UPOKT_TO_POKT_DEM), decimalPlaces, defaultValue)
}

const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const

interface ValueByBreakpoint<T = string> {
  xs: T
  sm: T
  md: T
  lg: T
  xl: T
}

export const calculateHeight = (init: string, ...arr: Partial<ValueByBreakpoint>[]) => {
  const objResult: Partial<ValueByBreakpoint> = {}
  const str = `calc(${init}`

  for (let i = 0; i < breakpoints.length; i++) {
    const breakpoint = breakpoints[i]
    let breakpointString = str

    for (const breakpointItem of arr) {
      if (breakpointItem[breakpoint]) {
        const value = breakpointItem[breakpoint]
        breakpointString += ` - ${value.replace('!important', '')}`
      } else if (i > 0) {
        for (let j = i - 1; j >= 0; j--) {
          const lowerBreak = breakpoints[j]

          if (breakpointItem[lowerBreak]) {
            const value = breakpointItem[lowerBreak]
            breakpointString += ` - ${value.replace('!important', '')}`
            break
          }
        }
      }
    }

    breakpointString += ')'
    objResult[breakpoint] = breakpointString
  }

  return objResult
}
