import type { Account, Contact, Workspace } from '@/types'
import Joi from 'joi'
import CryptoJs from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import {
  accountTable,
  contactTable,
  EncryptedContentIDB,
  workspaceTable,
  WorkspaceWithPass,
} from '@/config/idb'
import { KEY_ENC_DATA } from '@/constants'
import { accountJoiSchema } from '@/datasource/account'
import { contactJoiSchema } from '@/datasource/contact'
import { SupportedChains } from '@/constants/supportedChains'

const CURRENT_WORKSPACE_VERSION = '0.1.0'

interface Datasource<T extends { _id: string }> {
  searchByText(text: string, items: number): Promise<T[]>

  add(item: Omit<T, '_id'>): Promise<string>

  update(id: string, data: Partial<T>): Promise<boolean>

  remove(id: string): Promise<boolean>
}

export const searchWorkspaces = async (query: string): Promise<Workspace[]> => {
  const regex = new RegExp(query, 'i')

  const result = await workspaceTable
    .orderBy('name')
    .filter((workspace) => {
      return (
        !query ||
        workspace._id === query ||
        regex.test(workspace.name) ||
        (!!workspace.description && regex.test(workspace.description))
      )
    })
    .limit(15)
    .toArray()

  return result.map((workspace) => ({
    _id: workspace._id,
    name: workspace.name,
    description: workspace.description,
  }))
}

const workspaceJoiSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
}).required()

export const addWorkspace = async (workspace: Omit<Workspace, '_id'>, password: string) => {
  const validation = workspaceJoiSchema.validate(workspace, { allowUnknown: false })

  if (validation.error) {
    throw validation.error
  }

  const _id = uuidv4()
  const encrypted = CryptoJs.AES.encrypt(_id, password).toString()

  return workspaceTable.add({
    ...workspace,
    _id,
    version: CURRENT_WORKSPACE_VERSION,
    key: encrypted,
  }) as Promise<string>
}

export const loginAndReturnWorkspace = async (_id: string, key: string) => {
  const workspace = await workspaceTable.get(_id)

  if (workspace) {
    const password = CryptoJs.AES.decrypt(key, KEY_ENC_DATA).toString(CryptoJs.enc.Utf8)

    const decryptedPass = CryptoJs.AES.decrypt(workspace.key, password).toString(CryptoJs.enc.Utf8)

    if (decryptedPass === workspace._id) {
      return {
        workspace: {
          _id: workspace._id,
          name: workspace.name,
          description: workspace.description,
        },
        key: password,
      }
    }

    return null
  } else {
    return null
  }
}

export const loginOnWorkspace = async (_id: string, password: string) => {
  const workspace = await workspaceTable.get(_id)

  if (workspace) {
    const decryptedPass = CryptoJs.AES.decrypt(workspace.key, password).toString(CryptoJs.enc.Utf8)

    return decryptedPass === workspace._id
  } else {
    throw Error('workspace does not exists')
  }
}

export const exportWorkspace = async (_id: string) => {
  const results = await Promise.all([
    workspaceTable.get(_id),
    accountTable.where('workspace_id').equals(_id).toArray(),
    contactTable.where('workspace_id').equals(_id).toArray(),
  ])

  const [workspace, accounts, contacts] = results

  if (workspace) {
    return {
      workspace,
      accounts,
      contacts,
    }
  }

  return null
}

const encryptedContentSchema = Joi.object({
  _id: Joi.string().guid({ version: 'uuidv4' }).required(),
  workspace_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  content: Joi.string().required(),
}).required()

const encryptedJoiSchema = Joi.object<EncryptedBody>({
  workspace: Joi.object({
    _id: Joi.string().guid({ version: 'uuidv4' }).required(),
    name: Joi.string().required(),
    description: Joi.string(),
    version: Joi.string().required(),
    key: Joi.string().required(),
  }).required(),
  accounts: Joi.array().items(encryptedContentSchema).required(),
  contacts: Joi.array().items(encryptedContentSchema).required(),
}).required()

interface EncryptedBody {
  workspace: WorkspaceWithPass
  accounts: EncryptedContentIDB[]
  contacts: EncryptedContentIDB[]
}

export type ImportWorkspaceResult =
  | 'invalid_json'
  | 'invalid_password'
  | 'unknown_error'
  | 'imported'
  | 'already_exists'
  | 'address_repeated'

export const importWorkspace = async (
  content: string,
  password: string
): Promise<ImportWorkspaceResult> => {
  let json: object

  try {
    json = JSON.parse(content)
  } catch (e) {
    return 'invalid_json'
  }

  const encryptedValidation = encryptedJoiSchema.validate(json)

  if (encryptedValidation.error) {
    return 'invalid_json'
  }

  const { workspace, accounts, contacts } = encryptedValidation.value

  const decryptedPass = CryptoJs.AES.decrypt(workspace.key, password).toString(CryptoJs.enc.Utf8)

  if (decryptedPass === workspace._id) {
    if (workspace.version !== CURRENT_WORKSPACE_VERSION) {
      return 'invalid_json'
    }

    const addressesByChainMap: Record<string, SupportedChains> = {}

    for (const { workspace_id, content } of [...accounts, ...contacts]) {
      const decryptedContent = CryptoJs.AES.decrypt(content, password).toString(CryptoJs.enc.Utf8)

      if (workspace_id !== workspace._id || !decryptedContent) {
        return 'invalid_json'
      }

      try {
        const parsed: Account | Contact = JSON.parse(decryptedContent)
        const joiSchema = 'name' in parsed ? accountJoiSchema : contactJoiSchema

        const validation = joiSchema.validate(parsed, { allowUnknown: true })

        if (validation.error) {
          return 'invalid_json'
        }

        if ('name' in parsed) {
          if (addressesByChainMap[parsed.address] === parsed.chain) {
            return 'address_repeated'
          } else {
            addressesByChainMap[parsed.address] = parsed.chain
          }
        } else {
          for (const wallet of parsed.wallets) {
            if (addressesByChainMap[wallet.address] === wallet.chain) {
              return 'address_repeated'
            } else {
              addressesByChainMap[wallet.address] = wallet.chain
            }
          }
        }
      } catch (e) {
        return 'invalid_json'
      }
    }

    const workspaceOnDb = await workspaceTable.get(workspace._id)

    if (workspaceOnDb) {
      return 'already_exists'
    }

    try {
      await workspaceTable.db.transaction(
        'rw',
        workspaceTable,
        contactTable,
        accountTable,
        async () => {
          await Promise.all([
            workspaceTable.add(workspace),
            contactTable.bulkAdd(contacts),
            accountTable.bulkAdd(accounts),
          ])
        }
      )

      return 'imported'
    } catch (e) {
      return 'unknown_error'
    }
  } else {
    return 'invalid_password'
  }
}

export const removeWorkspace = async (workspaceId: string, password: string) => {
  const passwordMatch = await loginOnWorkspace(workspaceId, password)

  if (!passwordMatch) {
    throw Error('invalid_password')
  }

  return workspaceTable.db.transaction(
    'rw',
    workspaceTable,
    contactTable,
    accountTable,
    async () => {
      await Promise.all([
        workspaceTable.delete(workspaceId),
        contactTable.where('workspace_id').equals(workspaceId).delete(),
        accountTable.where('workspace_id').equals(workspaceId).delete(),
      ])
    }
  )
}

export const updateWorkspace = async (
  workspaceId: string,
  password: string,
  workspace: Omit<Workspace, '_id'>
) => {
  const passwordMatch = await loginOnWorkspace(workspaceId, password)

  if (!passwordMatch) {
    throw Error('invalid_password')
  }

  const result = await workspaceTable.update(workspaceId, {
    name: workspace.name,
    description: workspace.description,
  })

  return result === 1
}
