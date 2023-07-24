import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { SupportedChains } from '@/constants/supportedChains'

type UsdByCryptoCurrency = Record<
  SupportedChains,
  {
    price: number
    percent_change_24h: number
  }
>

const emptyUsdByCryptoCurrency: UsdByCryptoCurrency = {
  pocket: {
    price: 0,
    percent_change_24h: 0,
  },
  ethereum: {
    price: 0,
    percent_change_24h: 0,
  },
}

const coinMarketIdByChain: Record<SupportedChains, number> = {
  pocket: 11823,
  ethereum: 1027,
} as const

interface ResponseLatestQuote {
  data: Record<
    number,
    {
      id: number
      name: string
      symbol: string
      slug: string
      circulating_supply: number
      total_supply: number
      date_added: string
      last_updated: string
      num_market_pairs: number
      is_active: number
      infinite_supply: boolean
      cmc_rank: number
      is_fiat: number
      quote: {
        USD: {
          price: number
          volume_24h: number
          volume_change_24h: number
          percent_change_1h: number
          percent_change_24h: number
          percent_change_7d: number
          percent_change_30d: number
          percent_change_60d: number
          percent_change_90d: number
          market_cap: number
          market_cap_dominance: number
          fully_diluted_market_cap: number
          last_updated: string
        }
      }
    }
  >
}

export const cryptoPricesSlice = createApi({
  reducerPath: 'cryptoPrices',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/coinmarket',
  }),
  endpoints: (builder) => {
    return {
      fetchPrices: builder.query<UsdByCryptoCurrency, void>({
        query: () =>
          `/v2/cryptocurrency/quotes/latest?id=${Object.values(coinMarketIdByChain).join(',')}`,
        transformResponse: (response: ResponseLatestQuote): UsdByCryptoCurrency => {
          return Object.values(SupportedChains).reduce<UsdByCryptoCurrency>(
            (acc, chain: SupportedChains) => {
              return {
                ...acc,
                [chain]: {
                  price: response.data[coinMarketIdByChain[chain]]?.quote?.USD?.price || 0,
                  percent_change_24h:
                    response.data[coinMarketIdByChain[chain]]?.quote?.USD?.percent_change_24h || 0,
                },
              }
            },
            { ...emptyUsdByCryptoCurrency }
          )
        },
      }),
    }
  },
})

export const { useFetchPricesQuery } = cryptoPricesSlice
