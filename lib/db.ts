import Dexie, { type Table } from "dexie"

export interface Snapshot {
  id: string
  createdAt: Date
  name: string
  note: string
  tags: string[]
  windows: Array<{
    id: number
    tabs: Array<{
      url: string
      title: string
      favIconUrl?: string
      pinned?: boolean
    }>
  }>
}

export interface DomainStat {
  domain: string
  totalTimeMs: number
  visitCount: number
  lastVisit: Date
}

export class DrWhoDatabase extends Dexie {
  snapshots!: Table<Snapshot, string>
  domainStats!: Table<DomainStat, string>

  constructor() {
    super("DrWhoDB")
    
    // We only index properties we might want to query/filter by.
    this.version(1).stores({
      snapshots: "id, createdAt, name", // primary key and indexed props
      domainStats: "domain, lastVisit, visitCount" // primary key and indexed props
    })
  }
}

export const db = new DrWhoDatabase()
