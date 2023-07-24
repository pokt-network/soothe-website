import type { Account } from '@/types'
import Joi from 'joi'
import CryptoJs from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import { KEY_ENC_DATA } from '@/constants'
import { accountTable } from '@/config/idb'
import { SupportedChains } from '@/constants/supportedChains'
import { checkIfAddressesAreInUsed, checkWorkspacePermission } from '@/datasource/common'

export interface BaseAccountDatasource {
  workspaceId: string

  getAll(): Promise<Account[]>

  add(account: Omit<Account, '_id'>): Promise<string>

  update(_id: string, data: Partial<Omit<Account, '_id'>>): Promise<boolean>

  remove(_id: string): Promise<boolean>
}

export const accountJoiSchema = Joi.object({
  address: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  chain: Joi.string()
    .valid(...Object.values(SupportedChains))
    .required(),
}).required()

export class OfflineAccountDs implements BaseAccountDatasource {
  private key: string
  workspaceId: string

  constructor(workspaceId: string, pass: string) {
    this.workspaceId = workspaceId
    this.key = pass
  }

  async getAll(): Promise<Account[]> {
    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    return accountTable
      .where('workspace_id')
      .equals(this.workspaceId)
      .toArray()
      .then((accounts) => {
        return accounts
          .map((account) => {
            let accountDecrypted: Omit<Account, '_id'>

            try {
              const content = CryptoJs.AES.decrypt(account.content, pass).toString(
                CryptoJs.enc.Utf8
              )
              accountDecrypted = JSON.parse(content)
            } catch (e) {
              return
            }

            return {
              _id: account._id,
              ...accountDecrypted,
            } as Account
          })
          .filter((acc) => !!acc)
      })
  }

  async add(account: Omit<Account, '_id'>): Promise<string> {
    const validation = accountJoiSchema.validate(account, { allowUnknown: false })

    if (validation.error) {
      throw validation.error
    }

    await checkIfAddressesAreInUsed(this.workspaceId, this.key, [account])

    const _id = uuidv4()
    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const encrypted = CryptoJs.AES.encrypt(JSON.stringify(account), pass).toString()

    return accountTable.add({
      _id,
      workspace_id: this.workspaceId,
      content: encrypted,
    }) as Promise<string>
  }

  async update(_id: string, data: Omit<Account, '_id'>): Promise<boolean> {
    const validation = accountJoiSchema.validate(data, { allowUnknown: false })

    if (validation.error) {
      throw validation.error
    }

    await checkWorkspacePermission(accountTable, _id, this.workspaceId, this.key)
    await checkIfAddressesAreInUsed(this.workspaceId, this.key, [data], _id)

    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const newAccountString = JSON.stringify(data)
    const newAccountEncrypted = CryptoJs.AES.encrypt(newAccountString, pass).toString()

    const result = await accountTable.update(_id, { content: newAccountEncrypted })

    if (result === 0) {
      throw Error('not found')
    }

    return result === 1
  }

  async remove(_id: string): Promise<boolean> {
    await checkWorkspacePermission(accountTable, _id, this.workspaceId, this.key)

    return accountTable
      .delete(_id)
      .then(() => {
        return true
      })
      .catch(() => {
        return false
      })
  }
}
