import { Moment } from 'moment-timezone'

export type BalanceByAddressType = { address: string; balance: number }

export interface ListTransferItem {
  height: number
  hash: string
  block_time: Moment
  from_address: string
  to_address: string
  type: 'transfer' | 'deposit'
  amount: number
  fee: number
}

export interface ListTransfersByAddressResponse {
  nextCursorPage?: string | number
  hasNextPage: boolean
  items: Array<ListTransferItem>
}

export interface IPendingBalanceByAddress {
  address: string
  pending_balance: number
}

export interface TransferSummary {
  pending_balance: number
  deposits: number
  transfers: number
  amount_transferred: number
  amount_deposited: number
  failed_transfers: number
}

export interface BaseChainDatasource {
  getAccountsBalance(addresses: string[]): Promise<Array<BalanceByAddressType>>

  getBalance(address: string): Promise<number>

  listTransfersByAddress(
    address: string,
    items: number,
    pageCursor?: string | number
  ): Promise<ListTransfersByAddressResponse>

  getTransferFee(): Promise<number>

  getPendingBalanceByAccount?: (addresses: string[]) => Promise<IPendingBalanceByAddress[]>

  getTransferMonthSummaryForAccount?: (address: string) => Promise<TransferSummary>
}
