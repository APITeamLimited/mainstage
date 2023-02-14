import type { Map as YMap } from 'yjs'

import type { YJSModule } from 'src/contexts/imports'

export const getOrCreateSubYMap = (
  Y: YJSModule,
  parentYMap: YMap<any>,
  key: string
): YMap<any> => {
  const subMap = parentYMap.get(key) as YMap<any> | undefined

  if (subMap) {
    return subMap
  }

  const newSubMap = new Y.Map()

  parentYMap.set(key, newSubMap)

  return newSubMap
}
