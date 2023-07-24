import { SupportedChains } from '@/constants/supportedChains'
import { BaseChainDatasource } from '@/datasource/chains/base'
import { EthereumDatasource } from '@/datasource/chains/ethereum'
import { PoktDatasource } from '@/datasource/chains/pokt'

export const DatasourceByChain: Record<SupportedChains, BaseChainDatasource> = {
  ethereum: new EthereumDatasource(),
  pocket: new PoktDatasource(),
}

export default DatasourceByChain
