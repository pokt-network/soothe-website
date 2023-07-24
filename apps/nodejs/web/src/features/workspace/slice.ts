import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import CryptoJs from 'crypto-js'
import {KEY_ENC_DATA} from '@/constants'

interface Workspace {
  _id: string
  name: string
  description?: string
}

interface WorkspaceState {
  workspace: Workspace | null
  key: string | null
}

const initialState: WorkspaceState = {
  workspace: null,
  key: null,
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspace: (state: WorkspaceState, action: PayloadAction<WorkspaceState>) => {
      if (!action.payload) {
        throw Error('Workspace not provided')
      }
      state.workspace = action.payload.workspace
      state.key = CryptoJs.AES.encrypt(action.payload.key!, KEY_ENC_DATA).toString()
    },
    clearWorkspace: (state: WorkspaceState, action: PayloadAction) => {
      state.workspace = null
      state.key = null
    },
  },
})

export const {setWorkspace, clearWorkspace} = workspaceSlice.actions

export default workspaceSlice.reducer
