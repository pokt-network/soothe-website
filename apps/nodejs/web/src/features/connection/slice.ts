import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import ProviderService, { SupportedExtensionsProtocol } from '@/provider'
import EthereumProvider from '@/provider/ethereum'
import PocketProvider from '@/provider/pocket'

type Permissions = 'list_accounts' | 'create_accounts' | 'suggest_transfer'

type ConnectionStatus = 'connected' | 'connecting' | 'not_connected'

interface ConnectionInfo {
  status: ConnectionStatus
  accounts: Array<string>
  chainId: string | null
}

export interface ProviderInfo {
  uuid: string
  name: string
  icon?: string
  rdns?: string
}

interface ConnectionState extends Record<SupportedExtensionsProtocol, ConnectionInfo> {
  providersByProtocol: Record<SupportedExtensionsProtocol, Array<ProviderInfo>>
  connectionByProtocol: Record<
    SupportedExtensionsProtocol,
    {
      showConnectDialog?: boolean
      providerUuid: string
      status: ConnectionStatus
      accounts: Array<string>
    }
  >
  status: 'connected' | 'connecting' | 'not_connected' | 'disconnecting'
  permissions: Permissions[]
}

export const loadProviders = createAsyncThunk('connection/loadProviders', async () => {
  const [ethRes, poktRes] = await Promise.all([
    EthereumProvider.getProvidersListAndConnection(),
    PocketProvider.getProvidersListAndConnection(),
  ])

  return {
    [SupportedExtensionsProtocol.Pocket]: poktRes,
    [SupportedExtensionsProtocol.Ethereum]: ethRes,
  }
})

export const connectToWallet = createAsyncThunk(
  'connection/connectToWallet',
  async ({ protocol, uuid }: { protocol: SupportedExtensionsProtocol; uuid: string }) => {
    const ProviderApiClass = ProviderService.getProviderClass(protocol)

    const provider = await ProviderApiClass.getProvider(uuid)
    const providerApi = new ProviderApiClass(provider)

    return await providerApi.connect()
  }
)

export const listConnectedAccounts = createAsyncThunk(
  'connection/listConnectedAccounts',
  async (protocol: SupportedExtensionsProtocol) => {
    const provider = ProviderService.getProvider(protocol)

    return provider.listAccounts()
  }
)

export const checkChainConnected = createAsyncThunk(
  'connection/checkChainConnected',
  async (protocol: SupportedExtensionsProtocol) => {
    const provider = ProviderService.getProvider(protocol)

    return provider.getChainConnected()
  }
)

const initialState: ConnectionState = {
  status: 'not_connected',
  permissions: [],
  providersByProtocol: {
    [SupportedExtensionsProtocol.Ethereum]: [],
    [SupportedExtensionsProtocol.Pocket]: [],
  },
  connectionByProtocol: {
    [SupportedExtensionsProtocol.Ethereum]: {
      providerUuid: null,
      accounts: [],
      status: 'not_connected',
      showConnectDialog: false,
    },
    [SupportedExtensionsProtocol.Pocket]: {
      providerUuid: null,
      accounts: [],
      status: 'not_connected',
      showConnectDialog: false,
    },
  },
  [SupportedExtensionsProtocol.Ethereum]: {
    chainId: null,
    accounts: [],
    status: 'not_connected',
  },
  [SupportedExtensionsProtocol.Pocket]: {
    chainId: null,
    accounts: [],
    status: 'not_connected',
  },
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

    setAccounts(
      state,
      action: PayloadAction<{ protocol: SupportedExtensionsProtocol; accounts: Array<string> }>
    ) {
      const { protocol, accounts } = action.payload
      state.connectionByProtocol[protocol].accounts = accounts
    },
    setChainId(
      state,
      action: PayloadAction<{ protocol: SupportedExtensionsProtocol; chainId: string }>
    ) {
      const { protocol, chainId } = action.payload
      state[protocol].chainId = chainId
    },
    resetConnection(state, action: PayloadAction<SupportedExtensionsProtocol>) {
      const protocol = action.payload

      state.connectionByProtocol[protocol].status = 'not_connected'
      state.connectionByProtocol[protocol].accounts = []
      state.connectionByProtocol[protocol].providerUuid = null
    },
    addProtocolProvider: (
      state,
      action: PayloadAction<{
        protocol: SupportedExtensionsProtocol
        provider: ProviderInfo
      }>
    ) => {
      const { protocol, provider } = action.payload
      const alreadySaved = state.providersByProtocol[protocol].some(
        (item) => item.uuid === provider.uuid
      )

      if (!alreadySaved) {
        state.providersByProtocol[protocol].push(provider)
      }
    },
    displayConnectDialog: (state, action: PayloadAction<SupportedExtensionsProtocol>) => {
      state.connectionByProtocol[action.payload].showConnectDialog = true
    },
    hideConnectDialog: (state, action: PayloadAction<SupportedExtensionsProtocol>) => {
      state.connectionByProtocol[action.payload].showConnectDialog = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadProviders.pending, (state) => {
      state.connectionByProtocol[SupportedExtensionsProtocol.Pocket].status = 'connecting'
      state.connectionByProtocol[SupportedExtensionsProtocol.Ethereum].status = 'connecting'
    })
    builder.addCase(loadProviders.fulfilled, (state, action) => {
      const { providerList: poktProviders, connectionInfo: poktConnection } =
        action.payload[SupportedExtensionsProtocol.Pocket]

      const { providerList: ethProviders, connectionInfo: ethConnection } =
        action.payload[SupportedExtensionsProtocol.Ethereum]

      state.providersByProtocol[SupportedExtensionsProtocol.Pocket] = poktProviders
      state.providersByProtocol[SupportedExtensionsProtocol.Ethereum] = ethProviders

      state.connectionByProtocol[SupportedExtensionsProtocol.Pocket] = {
        accounts: poktConnection?.accounts || [],
        providerUuid: poktConnection?.providerUuid || null,
        status: poktConnection?.accounts?.length > 0 ? 'connected' : 'not_connected',
      }

      state.connectionByProtocol[SupportedExtensionsProtocol.Ethereum] = {
        accounts: ethConnection?.accounts || [],
        providerUuid: ethConnection?.providerUuid || null,
        status: ethConnection?.accounts?.length > 0 ? 'connected' : 'not_connected',
      }
    })
    builder.addCase(loadProviders.rejected, (state) => {
      state.connectionByProtocol[SupportedExtensionsProtocol.Pocket].status = 'not_connected'
      state.connectionByProtocol[SupportedExtensionsProtocol.Ethereum].status = 'not_connected'
    })

    builder.addCase(connectToWallet.pending, (state, action) => {
      const { protocol, uuid } = action.meta.arg
      state.connectionByProtocol[protocol].accounts = []
      state.connectionByProtocol[protocol].status = 'connecting'
      state.connectionByProtocol[protocol].providerUuid = uuid
    })
    builder.addCase(connectToWallet.fulfilled, (state, action) => {
      const { protocol, uuid } = action.meta.arg

      const accounts = action.payload

      state.connectionByProtocol[protocol].accounts = accounts
      state.connectionByProtocol[protocol].status = accounts.length ? 'connected' : 'not_connected'
      state.connectionByProtocol[protocol].providerUuid = accounts.length ? uuid : null
    })
    builder.addCase(connectToWallet.rejected, (state, action) => {
      const { protocol } = action.meta.arg
      state.connectionByProtocol[protocol].accounts = []
      state.connectionByProtocol[protocol].providerUuid = null
      state.connectionByProtocol[protocol].status = 'not_connected'
    })

    builder.addCase(listConnectedAccounts.fulfilled, (state, action) => {
      const protocol = action.meta.arg

      const accounts = action.payload

      state[protocol].accounts = accounts
      state[protocol].status = accounts.length ? 'connected' : 'not_connected'
    })
    builder.addCase(listConnectedAccounts.rejected, (state, action) => {
      const protocol = action.meta.arg
      state[protocol].accounts = []
      state[protocol].status = 'not_connected'
    })

    builder.addCase(checkChainConnected.fulfilled, (state, action) => {
      const protocol = action.meta.arg
      const chainId = action.payload
      state[protocol].chainId = chainId
    })

    builder.addCase(checkChainConnected.rejected, (state, action) => {
      const protocol = action.meta.arg
      state[protocol].chainId = null
    })
  },
})

export const {
  addProtocolProvider,
  reset,
  setAccounts,
  resetConnection,
  displayConnectDialog,
  hideConnectDialog,
} = connectionSlice.actions

export default connectionSlice.reducer
