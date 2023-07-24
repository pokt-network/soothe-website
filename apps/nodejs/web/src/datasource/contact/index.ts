import type { Contact } from '@/types'
import Joi from 'joi'
import CryptoJs from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import { contactTable } from '@/config/idb'
import { ContactType, KEY_ENC_DATA } from '@/constants'
import { SupportedChains } from '@/constants/supportedChains'
import { checkIfAddressesAreInUsed, checkWorkspacePermission } from '@/datasource/common'

// todo: make generic BaseDatasource<T> and reusable OfflineDs
export interface BaseContactDatasource {
  workspaceId: string

  getAll(): Promise<Contact[]>

  add(contact: Omit<Contact, '_id'>): Promise<string>

  update(_id: string, data: Partial<Omit<Contact, '_id'>>): Promise<boolean>

  remove(_id: string): Promise<boolean>
}

export const contactJoiSchema = Joi.object({
  first_name: Joi.string().allow(''),
  last_name: Joi.string().allow(''),
  company_name: Joi.string().allow(''),
  display_name: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  phone_number: Joi.string().allow(''),
  type: Joi.string()
    .valid(...Object.values(ContactType))
    .required(),
  wallets: Joi.array()
    .required()
    .min(1)
    .items(
      Joi.object({
        address: Joi.string().required(),
        description: Joi.string().allow(''),
        alias: Joi.string().allow(''),
        chain: Joi.string()
          .valid(...Object.values(SupportedChains))
          .required(),
      }).required()
    ),
}).required()

export class OfflineContactDs implements BaseContactDatasource {
  private key: string
  workspaceId: string

  constructor(workspaceId: string, pass: string) {
    this.workspaceId = workspaceId
    this.key = pass
  }

  async getAll(): Promise<Contact[]> {
    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    return contactTable
      .where('workspace_id')
      .equals(this.workspaceId)
      .toArray()
      .then((contacts) => {
        return contacts
          .map((contact) => {
            let contactDecrypted: Omit<Contact, '_id'>

            try {
              const content = CryptoJs.AES.decrypt(contact.content, pass).toString(
                CryptoJs.enc.Utf8
              )
              contactDecrypted = JSON.parse(content)
            } catch (e) {
              return
            }

            return {
              _id: contact._id,
              ...contactDecrypted,
            } as Contact
          })
          .filter((acc) => !!acc)
      })
  }

  async add(contact: Omit<Contact, '_id'>): Promise<string> {
    const validation = contactJoiSchema.validate(contact, { allowUnknown: false })

    if (validation.error) {
      throw validation.error
    }

    await checkIfAddressesAreInUsed(this.workspaceId, this.key, contact.wallets)

    const _id = uuidv4()
    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const encrypted = CryptoJs.AES.encrypt(JSON.stringify(contact), pass).toString()

    return contactTable.add({
      _id,
      workspace_id: this.workspaceId,
      content: encrypted,
    }) as Promise<string>
  }

  async update(_id: string, data: Omit<Contact, '_id'>): Promise<boolean> {
    const validation = contactJoiSchema.validate(data, { allowUnknown: false })

    if (validation.error) {
      throw validation.error
    }
    await checkWorkspacePermission(contactTable, _id, this.workspaceId, this.key)
    await checkIfAddressesAreInUsed(this.workspaceId, this.key, data.wallets, _id)

    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const newContactString = JSON.stringify(data)
    const newContactEncrypted = CryptoJs.AES.encrypt(newContactString, pass).toString()

    const result = await contactTable.update(_id, { content: newContactEncrypted })

    if (result === 0) {
      throw Error('not found')
    }

    return result === 1
  }

  async remove(_id: string): Promise<boolean> {
    await checkWorkspacePermission(contactTable, _id, this.workspaceId, this.key)

    return contactTable
      .delete(_id)
      .then(() => {
        return true
      })
      .catch(() => {
        return false
      })
  }
}
