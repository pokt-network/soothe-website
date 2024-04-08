import type { Purpose } from '@/types'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BasePurposeDatasource, OfflinePurposeDs } from '@/datasource/transfer/purpose'

let purposeDs: BasePurposeDatasource | undefined

const checkAccountIsDefined = (
  accountDs: BasePurposeDatasource | undefined
): accountDs is BasePurposeDatasource => {
  if ((accountDs as BasePurposeDatasource)?.add === undefined) {
    throw Error('account datasource is undefined')
  }

  return true
}

export const initialize = createAsyncThunk<Purpose[], { key?: string; workspaceId: string }>(
  'purpose/initialize',
  async ({ key, workspaceId }) => {
    if (key) {
      purposeDs = new OfflinePurposeDs(workspaceId, key)
    } else {
      // to handle cloud datasource
    }

    return purposeDs.getAll()
  }
)

export const add = createAsyncThunk<Purpose, Omit<Purpose, '_id'>>(
  'purpose/add',
  async (purpose) => {
    const _id = await purposeDs.add(purpose)

    return {
      _id,
      ...purpose,
    }
  }
)

interface PurposeState {
  purposes: Purpose[]
  loading: boolean
  error: boolean
}

const initialState: PurposeState = {
  purposes: [],
  loading: false,
  error: false,
}

const purposeSlice = createSlice({
  name: 'purpose',
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

      state.purposes = action.payload
    })

    builder.addCase(add.fulfilled, (state, action) => {
      state.purposes.push(action.payload)
    })
  },
})

export const { reset } = purposeSlice.actions

export default purposeSlice.reducer
