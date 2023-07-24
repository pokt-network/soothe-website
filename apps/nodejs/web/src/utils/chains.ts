import type { SupportedChains } from '@/constants/supportedChains'
import type { IPendingBalanceByAddress } from '@/datasource/chains/base'
import DatasourceByChain from '@/datasource/chains'

export const getPendingBalanceOfAccountsByChain = async (
  addresses: string[],
  chain: SupportedChains
): Promise<IPendingBalanceByAddress[]> => {
  if (!DatasourceByChain[chain].getPendingBalanceByAccount) return

  if (!addresses.length) return []

  return DatasourceByChain[chain].getPendingBalanceByAccount(addresses)
}

export const getChainSupportPendingBalance = (chain: SupportedChains) =>
  !!DatasourceByChain[chain].getPendingBalanceByAccount
