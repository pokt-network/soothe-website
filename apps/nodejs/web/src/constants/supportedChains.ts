import { LabelAndValue } from '@/types'
import PocketIcon from '@/assets/icons/chains/pocket.svg'
import EthereumIcon from '@/assets/icons/chains/ethereum.svg'

export enum SupportedChains {
  ethereum = 'ethereum',
  'pocket' = 'pocket',
}

export const NetworksByChains: Record<SupportedChains, LabelAndValue[]> = {
  pocket: [
    {
      label: 'POKT Mainnet',
      value: 'pokt',
    },
  ],
  ethereum: [
    {
      label: 'Ethereum Mainnet',
      value: 'ethereum',
    },
  ],
}

interface DataOfChain {
  label: string
  code: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
}

export const DataByChain: Record<SupportedChains, DataOfChain> = {
  pocket: {
    label: 'Pocket',
    code: 'POKT',
    icon: PocketIcon,
  },
  ethereum: {
    label: 'Ethereum',
    code: 'ETH',
    icon: EthereumIcon,
  },
}

export const labelByChain: LabelAndValue<SupportedChains>[] = [
  {
    label: DataByChain[SupportedChains.pocket].label,
    value: SupportedChains.pocket,
  },
  {
    label: DataByChain[SupportedChains.ethereum].label,
    value: SupportedChains.ethereum,
  },
]

export const labelByChainMap = labelByChain.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.label }),
  {}
)
