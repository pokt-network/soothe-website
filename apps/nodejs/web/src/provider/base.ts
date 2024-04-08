export interface ProviderInfo {
  uuid: string
  name: string
  icon?: string
  rdns?: string
}

export interface BaseTransferParam {
  from: string
  to: string
  amount: number
}

export interface IProvider {
  connect: () => Promise<Array<string>>
  listAccounts: () => Promise<Array<string>>
  getChainConnected: () => Promise<string>
  sendTransfer: (param: BaseTransferParam) => Promise<string>
  switchNetwork: (chainId: string) => Promise<null>

  onChainChange(listener: (chainId: string) => void): void

  onAccountsChange(listener: (accounts: Array<string>) => void): void
}

export interface ProviderConstructor {
  getProvidersListAndConnection(): Promise<{
    providerList: Array<ProviderInfo>
    connectionInfo?: { providerUuid: string; accounts: Array<string> }
  }>

  getProvider(uuid: string): Promise<typeof window.ethereum | typeof window.pocketNetwork>

  new (provider: typeof window.ethereum | typeof window.pocketNetwork): IProvider
}
