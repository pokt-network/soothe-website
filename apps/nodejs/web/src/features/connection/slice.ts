import type { RootState } from '@/config/store'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

type Permissions = 'list_accounts' | 'create_accounts' | 'suggest_transfer'

interface ConnectionState {
  status: 'connected' | 'connecting' | 'not_connected' | 'disconnecting'
  permissions: Permissions[]
}

export interface ConnectionResponse {
  connectionEstablished: boolean
  permissions?: Permissions[]
}

interface DisconnectionResponse {
  disconnected: boolean
}

const sendAndWaitConnection = (): Promise<ConnectionResponse> =>
  new Promise((resolve, reject) => {
    const listener = (event) => {
      const data = event?.data

      if (data?.from === 'VAULT_KEYRING' && data?.type === 'CONNECTION_RESPONSE') {
        window.removeEventListener('message', listener)

        if (data?.data) {
          return resolve(data?.data)
        }

        return reject(data?.error)
      }
    }

    window.addEventListener('message', listener)

    window.postMessage({
      to: 'VAULT_KEYRING',
      type: 'CONNECTION_REQUEST',
      data: {
        suggestedPermissions: [
          'list_accounts',
          'suggest_transfer',
          'create_accounts',
        ] as Permissions[],
      },
    })
  })

export const establishVaultConnection = createAsyncThunk(
  'connection/establishVaultConnection',
  async () => {
    return sendAndWaitConnection()
  }
)

export const disconnectFromVault = createAsyncThunk<DisconnectionResponse>(
  'connection/disconnectFromVault',
  () => {
    return new Promise((resolve, reject) => {
      const listener = (event) => {
        const data = event?.data

        if (data?.from === 'VAULT_KEYRING' && data?.type === 'DISCONNECT_RESPONSE') {
          window.removeEventListener('message', listener)

          if (data?.data) {
            return resolve(data?.data)
          }

          return reject(data?.error)
        }
      }

      window.addEventListener('message', listener)

      window.postMessage({
        to: 'VAULT_KEYRING',
        type: 'DISCONNECT_REQUEST',
      })
    })
  }
)

const initialState: ConnectionState = {
  status: 'not_connected',
  permissions: [],
}

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    initializeVaultConnection: (state, action: PayloadAction<Permissions[]>) => {
      state.status = 'connected'
      state.permissions = action.payload
    },
    reset: (state) => {
      state.status = 'not_connected'
      state.permissions = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(establishVaultConnection.pending, (state) => {
      state.status = 'connecting'
    })
    builder.addCase(establishVaultConnection.fulfilled, (state, action) => {
      const result = action.payload

      if (result.connectionEstablished) {
        state.status = 'connected'
        state.permissions = result.permissions || []
      } else {
        state.status = 'not_connected'
      }
    })
    builder.addCase(establishVaultConnection.rejected, (state) => {
      state.status = 'not_connected'
    })

    builder.addCase(disconnectFromVault.pending, (state) => {
      state.status = 'disconnecting'
    })

    builder.addCase(disconnectFromVault.fulfilled, (state) => {
      state.status = 'not_connected'
      state.permissions = []
    })

    builder.addCase(disconnectFromVault.rejected, (state) => {
      state.status = 'not_connected'
      state.permissions = []
    })
  },
})

export const { initializeVaultConnection, reset } = connectionSlice.actions

export default connectionSlice.reducer
