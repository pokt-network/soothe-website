import PocketProvider, { PocketProviderNotInstalledMessage } from '@/provider/pocket'
import EthereumProvider, { EthereumProviderNotInstalledMessage } from '@/provider/ethereum'

export enum SupportedExtensionsProtocol {
  Pocket = 'Pocket',
  Ethereum = 'Ethereum',
}

type ReturnGetProvider<T extends SupportedExtensionsProtocol> =
  T extends SupportedExtensionsProtocol.Pocket
    ? InstanceType<typeof PocketProvider>
    : InstanceType<typeof EthereumProvider>
export default class ProviderService {
  static getProviderClass(protocol: SupportedExtensionsProtocol) {
    switch (protocol) {
      case SupportedExtensionsProtocol.Pocket:
        return PocketProvider
      case SupportedExtensionsProtocol.Ethereum:
        return EthereumProvider
      default:
        throw new Error('Protocol not supported')
    }
  }

  static getProvider<T extends SupportedExtensionsProtocol>(
    protocol: T,
    provider: typeof window.ethereum | typeof window.pocketNetwork
  ): ReturnGetProvider<T> {
    switch (protocol) {
      case SupportedExtensionsProtocol.Pocket:
        return new PocketProvider(provider) as ReturnGetProvider<T>
      case SupportedExtensionsProtocol.Ethereum:
        return new EthereumProvider(provider) as ReturnGetProvider<T>
      default:
        throw new Error('Protocol not supported')
    }
  }

  static isNotFoundError(error) {
    return [PocketProviderNotInstalledMessage, EthereumProviderNotInstalledMessage].includes(
      error?.message
    )
  }
}
