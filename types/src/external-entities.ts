export type FileFieldType = {
  data: StoredObject<string | ArrayBuffer>
  filename: string
} | null

export type StoredObject<T> = {
  __typename: 'StoredObject'
  storeReceipt: string
  data: T | null
}

export type LocalObject<T> = {
  __typename: 'LocalObject'
  localId: string
  data: T | null
}
