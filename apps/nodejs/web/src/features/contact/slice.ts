import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BaseContactDatasource, OfflineContactDs } from '@/datasource/contact'
import { Contact } from '@/types'
import { SupportedChains } from '@/constants/supportedChains'
import { AddressInUseError } from '@/datasource/common'

interface ContactState {
  contacts: Contact[]
  loading: boolean
  error: boolean
  contactsMap: Record<string, string>
  walletsByChainMap: Partial<
    Record<
      SupportedChains,
      Record<
        string,
        {
          name: string
          alias?: string
        }
      >
    >
  >
}

const initialState: ContactState = {
  contacts: [],
  loading: false,
  error: false,
  contactsMap: {},
  walletsByChainMap: {
    ...Object.values(SupportedChains).reduce((acc, chain) => ({ ...acc, [chain]: {} }), {}),
  },
}

let contactDs: BaseContactDatasource | undefined

const checkContactIsDefined = (contactD = contactDs): contactD is BaseContactDatasource => {
  if ((contactDs as BaseContactDatasource).add === undefined) {
    throw Error('contact datasource is undefined')
  }

  return true
}

export const initialize = createAsyncThunk<Contact[], { key?: string; workspaceId: string }>(
  'contact/initialize',
  async ({ key, workspaceId }) => {
    if (key) {
      contactDs = new OfflineContactDs(workspaceId, key)
    } else {
      // to handle cloud datasource
    }

    if (checkContactIsDefined(contactDs)) {
      return contactDs.getAll()
    }
  }
)

export const add = createAsyncThunk<Contact, Omit<Contact, '_id'>>(
  'contact/add',
  async (contact, { rejectWithValue }) => {
    try {
      if (checkContactIsDefined(contactDs)) {
        const _id = await contactDs.add(contact)

        return {
          _id,
          ...contact,
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

export const remove = createAsyncThunk<string, string>('contact/remove', async (_id) => {
  if (checkContactIsDefined(contactDs)) {
    const result = await contactDs.remove(_id)

    if (result) {
      return _id
    }

    return ''
  }
})

export const update = createAsyncThunk<Partial<Contact>, { _id: string; data: Partial<Contact> }>(
  'contact/update',
  async ({ _id, data }, { rejectWithValue }) => {
    try {
      if (checkContactIsDefined(contactDs)) {
        const result = await contactDs.update(_id, data)

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

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    reset: function (state: ContactState) {
      state.contacts = []
      state.contactsMap = {}
      state.loading = false
      state.error = false
      contactDs = undefined
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.loading = true
      state.error = false
    })

    builder.addCase(add.fulfilled, (state, action) => {
      state.contacts.push(action.payload)

      const { display_name, wallets } = action.payload

      for (const { address, chain, alias } of wallets) {
        state.contactsMap[address] = alias ? `${display_name} (${alias})` : display_name
        state.walletsByChainMap[chain][address] = {
          name: display_name,
          alias,
        }
      }
    })

    builder.addCase(remove.fulfilled, (state, action) => {
      if (action.payload) {
        let contactDeleted: Contact

        state.contacts = state.contacts.filter((item) => {
          if (action.payload !== item._id) {
            return true
          } else {
            contactDeleted = { ...item }
            return false
          }
        })

        if (contactDeleted) {
          for (const { address, chain } of contactDeleted.wallets) {
            delete state.contactsMap[address]
            delete state.walletsByChainMap[chain][address]
          }
        }
      }
    })

    builder.addCase(update.fulfilled, (state, action) => {
      const _id = action.payload._id
      let contactUpdated: Contact

      if (_id) {
        state.contacts = state.contacts.map((item) => {
          if (item._id === _id) {
            contactUpdated = {
              ...item,
              ...action.payload,
            }

            return contactUpdated
          } else {
            return item
          }
        })
      }

      const { display_name, wallets } = action.payload

      if (display_name || wallets) {
        const { display_name } = contactUpdated

        for (const { address, alias, chain } of contactUpdated.wallets) {
          state.contactsMap[address] = alias ? `${display_name} (${alias})` : display_name
          state.walletsByChainMap[chain][address] = {
            name: display_name,
            alias,
          }
        }
      }
    })

    builder.addCase(initialize.fulfilled, (state, action) => {
      state.contacts = action.payload

      for (const { wallets, display_name } of action.payload) {
        for (const { address, chain, alias } of wallets) {
          state.contactsMap[address] = alias ? `${display_name} (${alias})` : display_name
          state.walletsByChainMap[chain][address] = {
            name: display_name,
            alias,
          }
        }
      }

      state.loading = false
    })

    builder.addCase(initialize.rejected, (state) => {
      state.loading = false
      state.error = true
    })
  },
})

export const { reset } = contactSlice.actions

export default contactSlice.reducer
