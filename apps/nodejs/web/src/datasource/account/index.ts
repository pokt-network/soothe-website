import type { Account } from '@/types'
import Joi from 'joi'
import { accountTable } from '@/config/idb'
import { SupportedChains } from '@/constants/supportedChains'
import { checkIfAddressesAreInUsed } from '@/datasource/common'
import { BaseDatasource, OfflineBaseDs } from '@/datasource/base'

export type BaseAccountDatasource = BaseDatasource<Account>

export const accountJoiSchema = Joi.object({
  address: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  chain: Joi.string()
    .valid(...Object.values(SupportedChains))
    .required(),
}).required()

const customFn = (
  workspaceId: string,
  key: string,
  account: Omit<Account, '_id'>,
  entityId?: string
) => {
  return checkIfAddressesAreInUsed(workspaceId, key, [account], entityId)
}

export class OfflineAccountDs extends OfflineBaseDs<Account> {
  constructor(workspaceId: string, pass: string) {
    super({
      workspaceId,
      pass,
      joiSchema: accountJoiSchema,
      table: accountTable,
      customFn,
    })
  }
}
