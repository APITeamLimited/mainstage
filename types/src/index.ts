export * from './entities'
export * from './zustand-yjs'
export * from './globe-test'
export * from './entity-engine'
export * from './user'
export * from './team'
export * from './redis'
export * from './routes'
export * from './theme'

export type KeyValueItem = {
  id: number
  keyString: string
  value: string
  enabled: boolean
}

export type StoredObject<T> = {
  __typename: 'StoredObject'
  storeReceipt: string
  data: T | null
}
