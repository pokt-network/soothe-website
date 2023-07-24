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

class DB extends Dexie {
  workspaces: Table<WorkspaceWithPass>
  accounts: Table<EncryptedContentIDB>
  contacts: Table<EncryptedContentIDB>

  constructor() {
    super('blu_wallet_db')
    // todo: add version number from env
    this.version(2.1).stores({
      workspaces: '_id,name',
      accounts: '_id,workspace_id',
      contacts: '_id,workspace_id',
    })
  }
}

const db = new DB()

export const workspaceTable = db.workspaces
export const accountTable = db.accounts
export const contactTable = db.contacts
