import type { Purpose } from '@/types'
import Joi from 'joi'
import { purposeTable } from '@/config/idb'
import { BaseDatasource, OfflineBaseDs } from '@/datasource/base'

export type BasePurposeDatasource = BaseDatasource<Purpose>

export const purposeJoiSchema = Joi.object({
  name: Joi.string().required(),
}).required()

export class OfflinePurposeDs extends OfflineBaseDs<Purpose> {
  constructor(workspaceId: string, pass: string) {
    super({
      workspaceId,
      pass,
      joiSchema: purposeJoiSchema,
      table: purposeTable,
      defaultEntities: [
        {
          _id: '3f4fd10d-d5f5-4777-84aa-9327575f9f46',
          name: 'Asset Sales',
        },
        {
          _id: 'cdc159a8-e9d6-4ace-84aa-04111b1b6fdd',
          name: 'Customer Payment',
        },
      ],
    })
  }
}
