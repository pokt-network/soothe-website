import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BaseTransferDatasource, OfflineTransferDs, Transfer } from '@/datasource/transfer'

let transferDs: BaseTransferDatasource | undefined

export const initialize = createAsyncThunk<Transfer[], { key?: string; workspaceId: string }>(
  'transfer/initialize',
  async ({ key, workspaceId }) => {
    if (key) {
      transferDs = new OfflineTransferDs(workspaceId, key)
    } else {
      // to handle cloud datasource
    }

    return transferDs.getAll()
  }
)

interface UpsertTransferData {
  transfer: Omit<Transfer, '_id'>
  idOfRecord?: string
}

export const addTransfer = createAsyncThunk<Transfer, Omit<Transfer, '_id'>>(
  'transfer/addTransfer',
  async (transfer) => {
    const _id = await transferDs.add(transfer)

    return {
      ...transfer,
      _id,
    }
  }
)

export const updateTransfer = createAsyncThunk<Transfer, UpsertTransferData>(
  'transfer/addTransfer',
  async ({ transfer, idOfRecord }) => {
    await transferDs.update(idOfRecord, transfer)

    return {
      ...transfer,
      _id: idOfRecord,
    }
  }
)

interface TransferState {
  transfers: Transfer[]
  loading: boolean
  error: boolean
}

const initialState: TransferState = {
  transfers: [],
  loading: false,
  error: false,
}

const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    reset: (state) => {
      state = { ...initialState }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initialize.pending, (state) => {
      state.loading = true
    })
    builder.addCase(initialize.rejected, (state) => {
      state.error = true
      state.loading = false
    })
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.error = false
      state.loading = false

      state.transfers = action.payload
    })

    builder.addCase(addTransfer.fulfilled, (state, action) => {
      state.transfers.push(action.payload)
    })

    builder.addCase(updateTransfer.fulfilled, (state, action) => {
      const updatedTransfer = action.payload

      const index = state.transfers.findIndex((transfer) => transfer._id === updatedTransfer._id)

      if (index !== -1) {
        state.transfers.splice(index, 1, updatedTransfer)
      }
    })
  },
})
