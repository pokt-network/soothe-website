import type { Contact } from '@/types'
import Joi from 'joi'
import { ContactType } from '@/constants'
import { contactTable } from '@/config/idb'
import { OfflineBaseDs } from '@/datasource/base'
import { SupportedChains } from '@/constants/supportedChains'
import { checkIfAddressesAreInUsed } from '@/datasource/common'

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
    .optional()
    .allow(''),
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

const customFn = (
  workspaceId: string,
  key: string,
  contact: Omit<Contact, '_id'>,
  entityId?: string
) => {
  return checkIfAddressesAreInUsed(workspaceId, key, contact.wallets, entityId)
}

export class OfflineContactDs extends OfflineBaseDs<Contact> {
  constructor(workspaceId: string, pass: string) {
    super({
      workspaceId,
      pass,
      joiSchema: contactJoiSchema,
      table: contactTable,
      customFn,
    })
  }
}
