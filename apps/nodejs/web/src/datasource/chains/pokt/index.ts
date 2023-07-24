import {
  BaseChainDatasource,
  ListTransfersByAddressResponse,
  TransferSummary,
} from '@/datasource/chains/base'
import poktscanClient from '@/config/apolloClient/poktscan'
import {
  GetAccountTransferSummary,
  GetLatestBlock,
  GetPendingBalanceByAccount,
  GetPoktAccount,
  GetPoktAccountsBalance,
  ListPoktTransfers,
} from '@/datasource/chains/pokt/document'
import { convertToPoktNumber } from '@/utils'
import moment from 'moment-timezone'
import { ISO_DATE_FORMAT } from '@soothe/common/constants'
import { get } from 'lodash'

export class PoktDatasource implements BaseChainDatasource {
  async getAccountsBalance(
    addresses: string[]
  ): Promise<Array<{ address: string; balance: number }>> {
    const response = await poktscanClient.query({
      query: GetPoktAccountsBalance,
      variables: {
        accounts: JSON.stringify(addresses),
        items: addresses.length,
      },
    })

    return response.data.ListPoktAccount.items?.map((item) => ({
      address: item!.address,
      balance: convertToPoktNumber(item!.amount),
    }))
  }

  async getBalance(address: string): Promise<number> {
    const response = await poktscanClient.query({
      query: GetPoktAccount,
      variables: {
        address,
      },
    })

    return convertToPoktNumber(response.data.GetAccount?.amount || 0)
  }

  async listTransfersByAddress(
    address: string,
    items = 25,
    pageCursor?: string | number
  ): Promise<ListTransfersByAddressResponse> {
    const response = await poktscanClient.query({
      query: ListPoktTransfers,
      variables: {
        address,
        items,
        cursor: typeof pageCursor === 'string' ? pageCursor : null,
      },
    })

    const { items: itemsFromResponse, pageInfo } = response.data.ListPoktTransferForSelection!

    return {
      nextCursorPage: pageInfo?.next || undefined,
      hasNextPage: pageInfo!.has_next,
      items: itemsFromResponse!.map((item) => ({
        height: item!.height,
        hash: item!.tx_hash,
        block_time: moment(item!.block_time).utc(),
        from_address: item!.from_address,
        to_address: item!.to_address,
        type: item!.flow === 'out' ? 'transfer' : 'deposit',
        amount: convertToPoktNumber(item!.amount),
        fee: convertToPoktNumber(item!.fee),
      })),
    }
  }

  async getTransferFee() {
    const response = await poktscanClient.query({
      query: GetLatestBlock,
    })

    return convertToPoktNumber(response.data.GetLatestBlock.block.fee_multiplier)
  }

  async getPendingBalanceByAccount(addresses: string[]) {
    const result = await poktscanClient.query({
      query: GetPendingBalanceByAccount,
      variables: {
        addresses,
      },
    })

    return result.data.pendingBalanceByAddress.map((item) => ({
      address: item.address,
      pending_balance: convertToPoktNumber(item.pending_balance),
    }))
  }

  async getTransferMonthSummaryForAccount(address: string): Promise<TransferSummary> {
    const startDate = moment().utc().startOf('month').toISOString()
    const endDate = moment().utc().endOf('day').toISOString()

    const result = await poktscanClient.query({
      query: GetAccountTransferSummary,
      variables: {
        input: {
          node_selection: {
            addresses: [address],
          },
          start_date: startDate,
          end_date: endDate,
          date_format: ISO_DATE_FORMAT,
        },
      },
    })

    const summary = get(result, 'data.summary', {})

    return {
      amount_transferred: convertToPoktNumber(get(summary, 'out_transfers_amount', 0)),
      transfers: get(summary, 'out_transfers', 0),
      failed_transfers: get(summary, 'failed_transfers', 0),
      amount_deposited: convertToPoktNumber(get(summary, 'in_transfers_amount', 0)),
      pending_balance: convertToPoktNumber(get(summary, 'pending_amount', 0)),
      deposits: get(summary, 'in_transfers', 0),
    }
  }
}
