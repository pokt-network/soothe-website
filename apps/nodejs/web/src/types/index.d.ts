import { SupportedChains } from '@/constants/supportedChains'
import { ContactType } from '@/constants'

export interface Workspace {
  _id: string
  name: string
  description?: string
}

export interface Account {
  _id: string
  address: string
  name: string
  description: string
  chain: SupportedChains
}

export interface Purpose {
  _id: string
  name: string
}

export interface Wallet {
  address: string
  description?: string
  alias?: string
  chain: SupportedChains
}

export interface Contact {
  _id: string
  first_name?: string
  last_name?: string
  company_name?: string
  display_name?: string
  email?: string
  phone_number?: string
  type: ContactType
  wallets: Wallet[]
}

export interface LabelAndValue<T = string> {
  label: string
  value: T
}

export interface SuggestedGasFee {
  low: Speed
  medium: Speed
  high: Speed
  estimatedBaseFee: string
  networkCongestion: number
  latestPriorityFeeRange: string[]
  historicalPriorityFeeRange: string[]
  historicalBaseFeeRange: string[]
  priorityFeeTrend: string
  baseFeeTrend: string
}

export interface Speed {
  suggestedMaxPriorityFeePerGas: string
  suggestedMaxFeePerGas: string
  minWaitTimeEstimate: number
  maxWaitTimeEstimate: number
  amount?: string
}
