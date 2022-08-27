export * from './entities'
export * from './zustand-yjs'
export * from './globe-test'

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
