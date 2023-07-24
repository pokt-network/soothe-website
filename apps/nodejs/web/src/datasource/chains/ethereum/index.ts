import { BaseChainDatasource, ListTransfersByAddressResponse } from '@/datasource/chains/base'
import { convertFromWeiToEtherNumber } from '@/utils'
import axios, { AxiosResponse } from 'axios'
import moment from 'moment-timezone'

type AccountsBalanceType = AxiosResponse<{
  result: {
    account: string
    balance: number
  }[]
}>

type AccountBalanceType = AxiosResponse<{
  status: number
  message: string
  result: number
}>

type ListTransferType = AxiosResponse<{
  status: number
  message: string
  result: Array<{
    blockNumber: string
    timeStamp: string
    hash: string
    from: string
    to: string
    value: string
    gasUsed: string
    gasPrice: string
  }>
}>

export class EthereumDatasource implements BaseChainDatasource {
  async getAccountsBalance(
    addresses: string[]
  ): Promise<Array<{ address: string; balance: number }>> {
    const response = await axios.get<any, AccountsBalanceType>(
      `/api/etherscan?module=account&action=balancemulti&address=${addresses.join(',')}&tag=latest`
    )

    return response.data.result.map((item) => ({
      address: item!.account,
      balance: convertFromWeiToEtherNumber(item!.balance),
    }))
  }

  async getBalance(address: string): Promise<number> {
    const response = await axios.get<any, AccountBalanceType>(
      `/api/etherscan?module=account&action=balance&address=${address}&tag=latest`
    )

    return convertFromWeiToEtherNumber(response.data.result)
  }

  async listTransfersByAddress(
    address: string,
    items = 25,
    pageCursor?: string | number
  ): Promise<ListTransfersByAddressResponse> {
    const page = typeof pageCursor === 'number' ? pageCursor : 1
    const response = await axios.get<any, ListTransferType>(
      `/api/etherscan?module=account&address=${address}&page=${page}&offset=${items}&sort=desc&action=txlist`
    )

    const result = response.data.result

    return {
      hasNextPage: result.length === items,
      nextCursorPage: result.length === items ? page + 1 : undefined,
      items: result.map((item) => ({
        amount: convertFromWeiToEtherNumber(Number(item.value)),
        from_address: item.from,
        hash: item.hash,
        to_address: item.to,
        fee: convertFromWeiToEtherNumber(Number(item.gasUsed) * Number(item.gasPrice)),
        height: Number(item.blockNumber),
        block_time: moment.unix(Number(item.timeStamp)).utc(),
        type: address === item.from ? 'transfer' : 'deposit',
      })),
    }
  }

  async getTransferFee() {
    //todo: add this method
    return 0
  }
}
