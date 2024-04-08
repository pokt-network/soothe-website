import { BaseTransferParam, IProvider, ProviderConstructor, ProviderInfo } from '@/provider/base'

export interface PocketParamTransfer {
  from: string
  to: string
  amount: string
  memo?: string
}

declare global {
  interface Window {
    pocketNetwork: {
      chainId?: 'mainnet'

      request(arg: { method: 'pokt_chain' }): Promise<{
        chain: 'testnet' | 'mainnet'
      }>
      request(arg: { method: 'pokt_requestAccounts' | 'pokt_accounts' }): Promise<Array<string>>
      request(arg: {
        method: 'pokt_sendTransaction'
        params: [PocketParamTransfer]
      }): Promise<{ hash: string }>
      request(arg: {
        method: 'wallet_switchPocketChain'
        params: [{ chainId: string }]
      }): Promise<null>

      on(name: 'chainChanged', listener: (chainId: string) => void): void
      on(name: 'accountsChanged', listener: (accounts: Array<string>) => void): void
    }
  }
}

export const PocketProviderNotInstalledMessage =
  'A pocket provider was not found, please install a Pocket wallet.'

export class PocketProviderNotInstalledError extends Error {
  constructor() {
    super(PocketProviderNotInstalledMessage)
  }
}

const PocketProvider: ProviderConstructor = class PocketProvider implements IProvider {
  provider: typeof window.pocketNetwork

  constructor(provider: typeof window.pocketNetwork) {
    this.provider = provider
  }

  async connect() {
    try {
      return await this.provider.request({ method: 'pokt_requestAccounts' })
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  async listAccounts() {
    try {
      return await this.provider.request({ method: 'pokt_accounts' })
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  async getChainConnected() {
    try {
      return await this.provider.request({ method: 'pokt_chain' }).then((res) => res.chain)
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      if (this.provider.chainId) {
        return this.provider.chainId
      }

      throw e
    }
  }

  async sendTransfer(param: BaseTransferParam) {
    try {
      const pocketTransactionParam: PocketParamTransfer = {
        from: param.from,
        to: param.to,
        amount: (param.amount * 1e6).toString(),
      }

      return await this.provider
        .request({ method: 'pokt_sendTransaction', params: [pocketTransactionParam] })
        .then(({ hash }) => hash)
    } catch (e) {
      this.throwProviderNotInstalledError(e)

      throw e
    }
  }

  async switchNetwork(chainId: string) {
    try {
      return await this.provider.request({
        method: 'wallet_switchPocketChain',
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
      throw new PocketProviderNotInstalledError()
    }
  }

  static async getProvidersListAndConnection() {
    const providerList: Array<ProviderInfo> = []

    if (window.pocketNetwork) {
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
          provider: typeof window.pocketNetwork
        }>
      ) => {
        // todo: add validation to event detail
        const { info, provider } = event.detail || {}
        providerList.push(info)

        const accountsConnected = (await provider.request({
          method: 'pokt_accounts',
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
            window.addEventListener('pocket:announceProvider', announceListener)

            window.dispatchEvent(new CustomEvent('pocket:requestProvider'))

            setTimeout(async () => {
              window.removeEventListener('pocket:announceProvider', announceListener)

              if (window.pocketNetwork && !connectionInfo?.accounts) {
                const accounts = await window.pocketNetwork.request({ method: 'pokt_accounts' })
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

  static async getProvider(uuid: string): Promise<typeof window.pocketNetwork> {
    if (uuid === 'browser') {
      return window.pocketNetwork
    }

    return new Promise((resolve, reject) => {
      try {
        const announceListener = async (
          event: CustomEvent<{
            info: ProviderInfo
            provider: typeof window.pocketNetwork
          }>
        ) => {
          // todo: add validation to event detail
          const { info, provider } = event.detail || {}

          if (info.uuid === uuid) {
            window.removeEventListener('pocket:announceProvider', announceListener)
            return resolve(provider)
          }
        }

        window.addEventListener('pocket:announceProvider', announceListener)

        window.dispatchEvent(new CustomEvent('pocket:requestProvider'))

        setTimeout(() => {
          window.removeEventListener('pocket:announceProvider', announceListener)
          return reject(Error('Not Found'))
        }, 1000)
      } catch (e) {
        reject(e)
      }
    })
  }
}

export default PocketProvider
