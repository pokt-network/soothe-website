import Dexie, { Table } from 'dexie'
import { Workspace } from '@/types'

export interface WorkspaceWithPass extends Workspace {
  key: string
  version: string
}

export interface EncryptedContentIDB {
  _id: string
  workspace_id: string
  content: string
}

export interface TransferEncryptedIDB extends EncryptedContentIDB {
  _id: string
  workspace_id: string
  content: string
}

class DB extends Dexie {
  workspaces: Table<WorkspaceWithPass>
  accounts: Table<EncryptedContentIDB>
  contacts: Table<EncryptedContentIDB>
  purposes: Table<EncryptedContentIDB>
  transfers: Table<TransferEncryptedIDB>

  constructor() {
    super(process.env.INDEX_DB_NAME)
    this.version(2.3).stores({
      workspaces: '_id,name',
      accounts: '_id,workspace_id',
      contacts: '_id,workspace_id',
      purposes: '_id,workspace_id',
      transfers: '_id,workspace_id',
    })
  }
}

const db = new DB()

export const workspaceTable = db.workspaces
export const accountTable = db.accounts
export const contactTable = db.contacts
export const purposeTable = db.purposes
export const transferTable = db.transfers
