import Joi from 'joi'
import { transferTable } from '@/config/idb'
import { BaseDatasource, OfflineBaseDs } from '@/datasource/base'

export interface Transfer {
  _id: string
  hash: string
  purpose: string
  internal_memo: string
}

export type BaseTransferDatasource = BaseDatasource<Transfer>

export const transferJoiSchema = Joi.object({
  hash: Joi.string().required(),
  purpose: Joi.string().uuid({ version: 'uuidv4' }),
  internal_memo: Joi.string().optional(),
}).required()

export class OfflineTransferDs extends OfflineBaseDs<Transfer> {
  constructor(workspaceId: string, pass: string) {
    super({
      workspaceId,
      pass,
      joiSchema: transferJoiSchema,
      table: transferTable,
    })
  }
}
