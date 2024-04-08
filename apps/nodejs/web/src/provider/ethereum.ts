import { BaseTransferParam, IProvider, ProviderConstructor, ProviderInfo } from '@/provider/base'

export interface EthTransferParam {
  from: string
  to: string
  value?: string
  gas?: string
  data?: string
  maxPriorityFeePerGas?: string
  maxFeePerGas?: string
}

declare global {
  interface Window {
    ethereum: {
      request(arg: { method: 'eth_chainId' }): Promise<string>
      request(arg: { method: 'eth_requestAccounts' | 'eth_accounts' }): Promise<Array<string>>
      request(arg: { method: 'eth_sendTransaction'; params: [EthTransferParam] }): Promise<string>
      request(arg: {
        method: 'wallet_switchEthereumChain'
        params: [{ chainId: string }]
      }): Promise<null>

      on(name: 'chainChanged', listener: (chainId: string) => void): void
      on(name: 'accountsChanged', listener: (accounts: Array<string>) => void): void
    }
  }
}

export const EthereumProviderNotInstalledMessage =
  'An ethereum provider was not found, please install an Ethereum wallet.'

export class EthereumProviderNotInstalledError extends Error {
  constructor() {
    super(EthereumProviderNotInstalledMessage)
  }
}

const EthereumProvider: ProviderConstructor = class EthereumProvider implements IProvider {
  provider: typeof window.ethereum

  constructor(provider: typeof window.ethereum) {
    this.provider = provider
  }

  async connect() {
    try {
      return await this.provider.request({ method: 'eth_requestAccounts' })
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  async listAccounts() {
    try {
      return await this.provider.request({ method: 'eth_accounts' })
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  async getChainConnected() {
    try {
      return await this.provider.request({ method: 'eth_chainId' })
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  async sendTransfer(param: BaseTransferParam) {
    try {
      const ethTransactionParam: EthTransferParam = {
        from: param.from,
        to: param.to,
        value: '0x' + (param.amount / 1e18).toString(16),
      }

      return await this.provider.request({
        method: 'eth_sendTransaction',
        params: [ethTransactionParam],
      })
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  async switchNetwork(chainId: string) {
    try {
      return await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  onChainChange(listener: (chainId: string) => void) {
    try {
      this.provider.on('chainChanged', listener)
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  onAccountsChange(listener: (accounts: Array<string>) => void) {
    try {
      this.provider.on('accountsChanged', listener)
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  private throwProviderNotInstalledError(error) {
    if (
      ['request', 'on']
        .map((property) => `Cannot read properties of undefined (reading '${property}')`)
        .includes(error?.message)
    ) {
      throw new EthereumProviderNotInstalledError()
    }
  }

  static async getProvidersListAndConnection() {
    const providerList: Array<ProviderInfo> = []

    if (window.ethereum) {
      providerList.push({
        name: 'Browser',
        uuid: 'browser',
      })

      let connectionInfo: { providerUuid: string; accounts: Array<string> } = {
        providerUuid: null,
        accounts: [],
      }

      const announceListener = async (
        event: CustomEvent<{
          info: ProviderInfo
          provider: typeof window.ethereum
        }>
      ) => {
        // todo: add validation to event detail
        const { info, provider } = event.detail || {}
        providerList.push(info)

        const accountsConnected = (await provider.request({
          method: 'eth_accounts',
        })) as Array<string>

        if (
          (!connectionInfo.providerUuid && accountsConnected.length) ||
          accountsConnected.length > connectionInfo.accounts.length
        ) {
          connectionInfo = {
            providerUuid: info.uuid,
            accounts: accountsConnected,
          }
        }
      }

      return new Promise<Awaited<ReturnType<ProviderConstructor['getProvidersListAndConnection']>>>(
        (resolve, reject) => {
          try {
            window.addEventListener('eip6963:announceProvider', announceListener)

            window.dispatchEvent(new CustomEvent('eip6963:requestProvider'))

            setTimeout(async () => {
              window.removeEventListener('eip6963:announceProvider', announceListener)

              if (window.ethereum && !connectionInfo?.accounts) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                if (!connectionInfo?.accounts?.length && accounts.length) {
                  connectionInfo.accounts = accounts
                  connectionInfo.providerUuid = 'browser'
                }
              }

              return resolve({ providerList, connectionInfo })
            }, 1000)
          } catch (e) {
            reject(e)
          }
        }
      )
    }

    return {
      providerList,
    }
  }

  static async getProvider(uuid: string): Promise<typeof window.ethereum> {
    if (uuid === 'browser') {
      return window.ethereum
    }

    return new Promise((resolve, reject) => {
      try {
        const announceListener = async (
          event: CustomEvent<{
            info: ProviderInfo
            provider: typeof window.ethereum
          }>
        ) => {
          // todo: add validation to event detail
          const { info, provider } = event.detail || {}

          if (info.uuid === uuid) {
            window.removeEventListener('eip6963:announceProvider', announceListener)
            return resolve(provider)
          }
        }

        window.addEventListener('eip6963:announceProvider', announceListener)

        window.dispatchEvent(new CustomEvent('eip6963:requestProvider'))

        setTimeout(() => {
          window.removeEventListener('eip6963:announceProvider', announceListener)
          return reject(Error('Not Found'))
        }, 1000)
      } catch (e) {
        reject(e)
      }
    })
  }
}

export default EthereumProvider
