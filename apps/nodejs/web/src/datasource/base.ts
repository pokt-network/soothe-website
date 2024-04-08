import type { Table } from 'dexie'
import type { EncryptedContentIDB } from '@/config/idb'
import CryptoJs from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import Joi, { ObjectSchema } from 'joi'
import { KEY_ENC_DATA } from '@/constants'
import { SupportedChains } from '@/constants/supportedChains'
import { checkWorkspacePermission } from '@/datasource/common'

export interface BaseDatasource<T extends { _id: string }> {
  workspaceId: string

  getAll(): Promise<T[]>

  add(item: Omit<T, '_id'>): Promise<string>

  update(_id: string, data: Partial<Omit<T, '_id'>>): Promise<boolean>

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

interface ConstructorArg<
  T extends { _id: string },
  U extends EncryptedContentIDB = EncryptedContentIDB
> {
  table: Table<U>
  joiSchema: ObjectSchema
  workspaceId: string
  pass: string
  customFn?: (
    workspaceId: string,
    key: string,
    entity: Omit<T, '_id'>,
    entityId?: string
  ) => Promise<void>
  defaultEntities?: T[]
}

export class OfflineBaseDs<
  T extends { _id: string },
  U extends EncryptedContentIDB = EncryptedContentIDB
> implements BaseDatasource<T>
{
  protected key: string
  workspaceId: string
  table: Table<U>
  joiSchema: ObjectSchema
  customFn?: (
    workspaceId: string,
    key: string,
    entity: Omit<T, '_id'>,
    entityId?: string
  ) => Promise<void>
  defaultEntities: T[] = []

  constructor({
    table,
    joiSchema,
    pass,
    workspaceId,
    customFn,
    defaultEntities,
  }: ConstructorArg<T, U>) {
    this.table = table
    this.workspaceId = workspaceId
    this.key = pass
    this.joiSchema = joiSchema
    this.customFn = customFn
    this.defaultEntities = defaultEntities || []
  }

  async getAll(): Promise<T[]> {
    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const result = await this.table
      .where('workspace_id')
      .equals(this.workspaceId)
      .toArray()
      .then((entities) => {
        return entities
          .map((entity) => {
            let entityDecrypted: Omit<T, '_id'>

            try {
              const content = CryptoJs.AES.decrypt(entity.content, pass).toString(CryptoJs.enc.Utf8)
              entityDecrypted = JSON.parse(content)
            } catch (e) {
              return
            }

            return {
              _id: entity._id,
              ...entityDecrypted,
            } as T
          })
          .filter((acc) => !!acc)
      })

    return [...this.defaultEntities, ...result]
  }

  async add(item: Omit<T, '_id'>): Promise<string> {
    const validation = this.joiSchema.validate(item, { allowUnknown: false })

    if (validation.error) {
      throw validation.error
    }

    if (this.customFn) {
      await this.customFn(this.workspaceId, this.key, item)
    }

    const _id = uuidv4()
    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const encrypted = CryptoJs.AES.encrypt(JSON.stringify(item), pass).toString()

    return this.table.add({
      _id,
      workspace_id: this.workspaceId,
      content: encrypted,
    } as U) as Promise<string>
  }

  async update(_id: string, data: Omit<T, '_id'>): Promise<boolean> {
    const validation = this.joiSchema.validate(data, { allowUnknown: false })

    if (validation.error) {
      throw validation.error
    }

    await checkWorkspacePermission(this.table, _id, this.workspaceId, this.key)

    if (this.customFn) {
      await this.customFn(this.workspaceId, this.key, data, _id)
    }

    // await checkIfAddressesAreInUsed(this.workspaceId, this.key, [data], _id)

    const pass = CryptoJs.AES.decrypt(this.key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const newString = JSON.stringify(data)
    const newEncrypted = CryptoJs.AES.encrypt(newString, pass).toString()

    const result = await this.table.update(_id, { content: newEncrypted })

    if (result === 0) {
      throw Error('not found')
    }

    return result === 1
  }

  async remove(_id: string): Promise<boolean> {
    await checkWorkspacePermission(this.table, _id, this.workspaceId, this.key)

    return this.table
      .delete(_id)
      .then(() => {
        return true
      })
      .catch(() => {
        return false
      })
  }
}
