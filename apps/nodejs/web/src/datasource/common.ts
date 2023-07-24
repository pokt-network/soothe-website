import type { SupportedChains } from '@/constants/supportedChains'
import type { Account, Contact } from '@/types'
import CryptoJs from 'crypto-js'
import isArray from 'lodash/isArray'
import { KEY_ENC_DATA } from '@/constants'
import { accountTable, contactTable } from '@/config/idb'

export const ADDRESS_IN_USED_MESSAGE = 'One address is already in used by an account or contact.'

export class AddressInUseError extends Error {
  readonly addressInUse: string
  readonly chainOfAddressInUse: SupportedChains

  constructor(
    addressInUse,
    chainOfAddressInUse: SupportedChains,
    message = ADDRESS_IN_USED_MESSAGE
  ) {
    super(message)
    this.addressInUse = addressInUse
    this.chainOfAddressInUse = chainOfAddressInUse
    this.name = 'AddressInUse'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'not found') {
    super(message)
    this.name == 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'unauthorized') {
    super(message)
    this.name == 'UnauthorizedError'
  }
}

export const checkIfAddressesAreInUsed = async (
  workspaceId: string,
  key: string,
  addressesByChain: { address: string; chain: SupportedChains }[],
  idOfEntity?: string
) => {
  const pass = CryptoJs.AES.decrypt(key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)
  const addressesByChainMap: Record<string, SupportedChains> = addressesByChain.reduce(
    (acc, item) => ({ ...acc, [item.address]: item.chain }),
    {}
  )

  let addressInUse: string
  let chainOfAddressInUse: SupportedChains

  await Promise.all([
    accountTable
      .where('workspace_id')
      .equals(workspaceId)
      .toArray()
      .then((accounts) => {
        return accounts.some((account) => {
          let accountDecrypted: Omit<Account, '_id'>

          try {
            const content = CryptoJs.AES.decrypt(account.content, pass).toString(CryptoJs.enc.Utf8)
            accountDecrypted = JSON.parse(content)
          } catch (e) {
            return
          }

          if (
            addressesByChainMap[accountDecrypted?.address] === accountDecrypted?.chain &&
            (!idOfEntity || idOfEntity !== account._id)
          ) {
            addressInUse = accountDecrypted?.address
            chainOfAddressInUse = accountDecrypted.chain
            return true
          }

          return false
        })
      }),
    contactTable
      .where('workspace_id')
      .equals(workspaceId)
      .toArray()
      .then((contacts) => {
        return contacts.some((contact) => {
          let contactDecrypted: Omit<Contact, '_id'>

          try {
            const content = CryptoJs.AES.decrypt(contact.content, pass).toString(CryptoJs.enc.Utf8)
            contactDecrypted = JSON.parse(content)
          } catch (e) {
            return
          }

          if (isArray(contactDecrypted?.wallets)) {
            for (const wallet of contactDecrypted.wallets) {
              if (
                addressesByChainMap[wallet?.address] === wallet?.chain &&
                (!idOfEntity || idOfEntity !== contact._id)
              ) {
                addressInUse = wallet?.address
                chainOfAddressInUse = wallet.chain
                return true
              }
            }
          }

          return false
        })
      }),
  ])

  if (addressInUse && chainOfAddressInUse) {
    throw new AddressInUseError(addressInUse, chainOfAddressInUse)
  }
}

export const checkWorkspacePermission = async (
  table: typeof accountTable | typeof contactTable,
  entityId: string,
  workspaceId: string,
  key: string
) => {
  const entity = await table.get(entityId)

  if (!entity) {
    throw new NotFoundError()
  }

  if (entity.workspace_id !== workspaceId) {
    throw new UnauthorizedError()
  }

  const pass = CryptoJs.AES.decrypt(key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

  try {
    const decryptedContent = CryptoJs.AES.decrypt(entity.content, pass).toString(CryptoJs.enc.Utf8)

    if (!decryptedContent) {
      throw new UnauthorizedError()
    }
  } catch (e) {
    throw new UnauthorizedError()
  }
}
