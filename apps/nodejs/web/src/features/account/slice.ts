import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BaseAccountDatasource, OfflineAccountDs } from '@/datasource/account'
import { Account } from '@/types'
import { SupportedChains } from '@/constants/supportedChains'
import { AddressInUseError } from '@/datasource/common'

interface AccountState {
  accounts: Account[]
  accountsByChain: Record<SupportedChains, Account[]>
  loading: boolean
  error: boolean
  accountsMap: Record<string, string>
}

const emptyAddressesByChain: Record<SupportedChains, Account[]> = {
  pocket: [] as Account[],
  ethereum: [] as Account[],
}

const initialState: AccountState = {
  accounts: [],
  accountsByChain: {
    ...emptyAddressesByChain,
  },
  loading: false,
  error: false,
  accountsMap: {},
}

let accountDs: BaseAccountDatasource | undefined

const returnAccountsOfChain = (accounts: Account[], chain: SupportedChains) => {
  return accounts.filter((item) => item.chain === chain)
}

const processAccountsByChain = (accounts: Account[]): Record<SupportedChains, Account[]> => {
  return accounts.reduce(
    (acc, item) => ({
      ...acc,
      [item.chain]: [...acc[item.chain], item],
    }),
    { ...emptyAddressesByChain }
  )
}

const checkAccountIsDefined = (
  accountDs: BaseAccountDatasource | undefined
): accountDs is BaseAccountDatasource => {
  if ((accountDs as BaseAccountDatasource).add === undefined) {
    throw Error('account datasource is undefined')
  }

  return true
}

export const initialize = createAsyncThunk<Account[], { key?: string; workspaceId: string }>(
  'account/initialize',
  async ({ key, workspaceId }) => {
    if (key) {
      accountDs = new OfflineAccountDs(workspaceId, key)
    } else {
      // to handle cloud datasource
    }

    if (checkAccountIsDefined(accountDs)) {
      return accountDs.getAll()
    }
  }
)

export const add = createAsyncThunk<Account, Omit<Account, '_id'>>(
  'account/add',
  async (account, { rejectWithValue }) => {
    try {
      if (checkAccountIsDefined(accountDs)) {
        const _id = await accountDs.add(account)

        return {
          _id,
          ...account,
        }
      }
    } catch (e) {
      if (e instanceof AddressInUseError) {
        return rejectWithValue({
          addressInUse: e.addressInUse,
          chainOfAddressInUse: e.chainOfAddressInUse,
        })
      }

      throw e
    }
  }
)

export const remove = createAsyncThunk<string, string>('account/remove', async (_id) => {
  if (checkAccountIsDefined(accountDs)) {
    const result = await accountDs.remove(_id)

    if (result) {
      return _id
    }

    return ''
  }
})

export const update = createAsyncThunk<Partial<Account>, { _id: string; data: Partial<Account> }>(
  'account/update',
  async ({ _id, data }, { rejectWithValue }) => {
    try {
      if (checkAccountIsDefined(accountDs)) {
        const result = await accountDs.update(_id, data)

        if (result) {
          return {
            _id,
            ...data,
          }
        } else {
          return {}
        }
      }
    } catch (e) {
      if (e instanceof AddressInUseError) {
        return rejectWithValue({
          addressInUse: e.addressInUse,
          chainOfAddressInUse: e.chainOfAddressInUse,
        })
      }

      throw e
    }
  }
)

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    reset: function (state: AccountState) {
      state.accounts = []
      state.accountsByChain = { ...emptyAddressesByChain }
      state.accountsMap = {}
      state.loading = false
      state.error = false
      accountDs = undefined
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.loading = true
      state.error = false
    })

    builder.addCase(add.fulfilled, (state, action) => {
      state.accounts.push(action.payload)
      state.accountsMap[action.payload.address] = action.payload.name
      state.accountsByChain[action.payload.chain].push(action.payload)
    })

    builder.addCase(remove.fulfilled, (state, action) => {
      if (action.payload) {
        let accountDeleted: Account

        state.accounts = state.accounts.filter((item) => {
          if (action.payload !== item._id) {
            return true
          } else {
            accountDeleted = { ...item }
            return false
          }
        })

        if (accountDeleted) {
          delete state.accountsMap[accountDeleted.address]
          state.accountsByChain[accountDeleted.chain] = returnAccountsOfChain(
            state.accounts,
            accountDeleted.chain!
          )
        }
      }
    })

    builder.addCase(update.fulfilled, (state, action) => {
      const _id = action.payload._id
      let accountUpdated: Account

      if (_id) {
        state.accounts = state.accounts.map((item) => {
          if (item._id === _id) {
            accountUpdated = {
              ...item,
              ...action.payload,
            }

            return accountUpdated
          } else {
            return item
          }
        })
      }

      if (action.payload.name || action.payload.address) {
        state.accountsMap[accountUpdated.address] = accountUpdated.name
      }
      state.accountsByChain[action.payload.chain] = returnAccountsOfChain(
        state.accounts,
        action.payload.chain!
      )
    })

    builder.addCase(initialize.fulfilled, (state, action) => {
      state.accounts = action.payload
      state.accountsMap = action.payload.reduce(
        (acc, item) => ({ ...acc, [item.address]: item.name }),
        {}
      )
      state.accountsByChain = processAccountsByChain(state.accounts)
      state.loading = false
    })

    builder.addCase(initialize.rejected, (state) => {
      state.loading = false
      state.error = true
    })
  },
})

export const { reset } = accountSlice.actions

export default accountSlice.reducer
