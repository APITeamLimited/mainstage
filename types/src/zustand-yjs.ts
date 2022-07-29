import * as Y from 'yjs'

export type MapWrapper<T, U extends Record<string, T>> = {
  data: U
} & MapFunctions<T>

export type MapFunctions<T> = Pick<
  Y.Map<T>,
  'set' | 'get' | 'has' | 'delete' | 'forEach' | 'entries' | 'values' | 'keys'
>
