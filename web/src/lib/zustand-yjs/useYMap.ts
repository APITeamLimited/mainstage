import { useMemo } from 'react'

import type { Map as YMap } from 'yjs'

import useYObserve from './useYObserve'
import useYStore from './useYStore'

type MapFunctions<T> = Pick<
  YMap<T>,
  'set' | 'get' | 'has' | 'delete' | 'forEach' | 'entries' | 'values' | 'keys'
>
type MapWrapper<T, U extends Record<string, T>> = { data: U } & MapFunctions<T>

const useYMap = <T, U extends Record<string, T>>(
  yMap: YMap<T>
): MapWrapper<T, U> => {
  useYObserve<YMap<T>>(yMap, () => yMap.toJSON())
  const dataSet = useYStore((state) => state.data)

  const data = useMemo(() => {
    const match = dataSet.find(([type]) => type === yMap)
    if (!match) return {}
    return match[1]
  }, [yMap, dataSet]) as U
  const noBinding = (funcKey: keyof YMap<T>) => () => {
    throw new Error(`Y.Map#${funcKey.toString()} is not implemented`)
  }
  return {
    keys:
      yMap !== undefined && yMap.keys
        ? yMap.keys.bind(yMap)
        : noBinding('keys'),
    values:
      yMap !== undefined && yMap.values
        ? yMap.values.bind(yMap)
        : noBinding('values'),
    entries:
      yMap !== undefined && yMap.entries
        ? yMap.entries.bind(yMap)
        : noBinding('entries'),
    forEach:
      yMap !== undefined && yMap.forEach
        ? yMap.forEach.bind(yMap)
        : noBinding('forEach'),
    delete:
      yMap !== undefined && yMap.delete
        ? yMap.delete.bind(yMap)
        : noBinding('delete'),
    set:
      yMap !== undefined && yMap.set ? yMap.set.bind(yMap) : noBinding('set'),
    get:
      yMap !== undefined && yMap.get ? yMap.get.bind(yMap) : noBinding('get'),
    has:
      yMap !== undefined && yMap.has ? yMap.has.bind(yMap) : noBinding('has'),
    data,
  }
}
export default useYMap
