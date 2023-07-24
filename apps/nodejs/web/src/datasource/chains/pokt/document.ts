import { graphql } from '@/gql/gql'

export const GetPoktAccountsBalance = graphql(`
  query ListPoktAccount($accounts: String!, $items: Int!) {
    ListPoktAccount(
      pagination: {
        limit: $items
        filter: {
          operator: AND
          properties: { operator: IN, value: $accounts, type: STRING, property: "address" }
        }
      }
    ) {
      items {
        address
        amount
      }
    }
  }
`)

export const GetPoktAccount = graphql(`
  query GetPoktAccount($address: ID) {
    GetAccount(address: $address) {
      address
      amount
      block_time
    }
  }
`)

export const ListPoktTransfers = graphql(`
  query ListPoktTransfers($address: String!, $items: Int!, $cursor: ID) {
    ListPoktTransferForSelection(
      input: {
        node_selection: { addresses: [$address] }
        pagination: {
          cursor: $cursor
          limit: $items
          sort: { property: "block_time", direction: -1 }
          filter: {
            operator: AND
            properties: { value: "0", property: "result_code", type: INT, operator: EQ }
          }
        }
      }
    ) {
      pageInfo {
        next
        has_next
      }
      items {
        height
        tx_hash
        block_time
        from_address
        to_address
        memo
        amount
        fee
        flow
      }
    }
  }
`)

export const GetLatestBlock = graphql(`
  query GetLatestBlock {
    GetLatestBlock {
      block {
        height
        fee_multiplier
      }
    }
  }
`)

export const GetPendingBalanceByAccount = graphql(`
  query GetPendingBalanceByAccount($addresses: [String!]!) {
    pendingBalanceByAddress: GetPendingBalanceByAddressForSelection(
      input: { addresses: $addresses }
    ) {
      address
      pending_balance
    }
  }
`)

export const GetAccountTransferSummary = graphql(`
  query GetAccountTransferSummary($input: GetTransactionSummaryForSelectionBetweenDatesInput!) {
    summary: GetTransferSummaryForSelectionBetweenDates(input: $input) {
      pending_transfers
      pending_amount
      successfully_transfers
      failed_transfers
      in_transfers
      out_transfers
      in_transfers_amount
      out_transfers_amount
    }
  }
`)
