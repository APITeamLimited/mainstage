import {
  getLocalObject,
  KeyValueItem,
  KVVariantTypes,
  LocalObject,
  validateKeyValueItem,
} from '@apiteam/types'
import type { Map as YMap } from 'yjs'

export const kvLegacyImporter = <T extends KVVariantTypes>(
  getterKey: string,
  parentYMap: YMap<any>,
  variant: T['variant']
): (KeyValueItem & T)[] => {
  const data = parentYMap.get(getterKey)

  if (Array.isArray(data) && data.length === 0) {
    return [] as KeyValueItem[]
  }

  if (data === undefined) {
    parentYMap.set(getterKey, [])
    return [] as KeyValueItem[]
  }

  if (Array.isArray(data)) {
    // Have enough info to cast to the correct type
    const validatedData = [] as KeyValueItem[]
    let beenFormatted = false

    data.forEach((rawItem) => {
      const validateResult = validateKeyValueItem(rawItem, variant)
      if (!validateResult) return

      const { item, changed } = validateResult

      if (changed) {
        beenFormatted = true
      }

      validatedData.push(item)
    })

    if (beenFormatted) {
      parentYMap.set(getterKey, validatedData)
    }

    if (variant === 'localvalue') {
      const workspaceId = parentYMap.doc?.guid

      if (workspaceId === undefined) {
        throw new Error('WorkspaceId is undefined')
      }

      return (validatedData as KeyValueItem[]).map((item) => {
        if (item.variant !== 'localvalue') {
          throw new Error('Invalid variant')
        }

        return {
          ...item,
          localValue: getLocalObject(item.localValue, workspaceId),
        } as KeyValueItem
      }) as KeyValueItem[]
    }

    return validatedData
  }

  throw new Error(`Invalid data type for ${getterKey}`)
}

export const kvExporter = (
  items: KeyValueItem[],
  variant: KeyValueItem['variant'],
  workspaceId: string
): KeyValueItem[] => {
  if (variant === 'localvalue') {
    return (items as KeyValueItem[]).map((item) => {
      if (item.variant !== 'localvalue') {
        throw new Error('Invalid variant')
      }

      return {
        ...item,
        localValue: setAndCleanLocalObject(item.localValue, workspaceId),
      } as KeyValueItem
    })
  }

  return items
}

/** Stores an updated LocalObject in localStorage and cleans the data for storage
in the entity engine */
export const setAndCleanLocalObject = (
  localObject: LocalObject,
  workspaceId: string
): LocalObject => {
  if (localObject.data === null) {
    localStorage.removeItem(`LocalObject:${workspaceId}-${localObject.localId}`)
  } else {
    localStorage.setItem(
      `LocalObject:${workspaceId}-${localObject.localId}`,
      JSON.stringify(localObject.data)
    )
  }

  return {
    ...localObject,
    data: null,
  }
}
