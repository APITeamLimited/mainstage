/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { FileFieldType, LocalObject } from './external-entities'

export type FileFieldKV =
  | {
      variant: 'filefield'
      fileField: FileFieldType
      fileEnabled: true
    }
  | {
      variant: 'filefield'
      fileEnabled: false
      value: string
    }

export type LocalValueKV = {
  variant: 'localvalue'
  value: string
  localValue: LocalObject<string>
}

export type DefaultKV = {
  variant: 'default'
  value: string
}

export type KVVariantTypes = FileFieldKV | LocalValueKV | DefaultKV

export type KeyValueItem<T extends KVVariantTypes> = {
  id: number
  keyString: string
  enabled: boolean
} & T

/**
 * Checks to ensure the keyvalue item is in the correct format
 */
export const validateKeyValueItem = <T extends KVVariantTypes>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  variant: KeyValueItem<T>['variant']
): {
  item: KeyValueItem<T>
  changed: boolean
} | null => {
  const itemVariant = item?.variant

  if (variant === 'filefield') {
    if (itemVariant === 'filefield') {
      return { item: item as KeyValueItem<T>, changed: false }
    } else if (itemVariant === undefined && typeof item.id === 'number') {
      const newItem: KeyValueItem<FileFieldKV> = {
        id: item.id,
        keyString: item.keyString ?? '',
        enabled: item.enabled ?? true,
        variant: 'filefield',
        fileEnabled: false,
        value: item.value,
      }
      return { item: newItem as unknown as KeyValueItem<T>, changed: true }
    } else {
      console.error(`Invalid itemVariant: ${itemVariant}`)
      return null
    }
  } else if (variant === 'localvalue') {
    if (itemVariant === 'localvalue') {
      return { item: item as KeyValueItem<T>, changed: false }
    } else if (itemVariant === undefined && typeof item.id === 'number') {
      const newItem: KeyValueItem<LocalValueKV> = {
        id: item.id,
        keyString: item.keyString ?? '',
        enabled: item.enabled ?? true,
        variant: 'localvalue',
        value: item.value ?? '',
        localValue: {
          __typename: 'LocalObject',
          localId: uuid(),
          data: null,
        },
      }
      return { item: newItem as unknown as KeyValueItem<T>, changed: true }
    } else {
      console.error(`Invalid itemVariant: ${itemVariant}`)
      return null
    }
  } else if (variant === 'default') {
    if (itemVariant === 'default') {
      return { item: item as KeyValueItem<T>, changed: false }
    } else if (itemVariant === undefined && typeof item.id === 'number') {
      const newItem: KeyValueItem<DefaultKV> = {
        id: item.id,
        keyString: item.keyString ?? '',
        enabled: item.enabled ?? true,
        variant: 'default',
        value: item.value ?? '',
      }
      return { item: newItem as unknown as KeyValueItem<T>, changed: true }
    } else {
      console.error(`Invalid itemVariant: ${itemVariant}`)
      return null
    }
  }

  console.error(`Invalid validator variant: ${variant}`)
  return null
}

export const kvLegacyImporter = <T extends KVVariantTypes>(
  getterKey: string,
  parentYMap: YMap<any>,
  variant: KeyValueItem<T>['variant']
): KeyValueItem<T>[] => {
  const data = parentYMap.get(getterKey)

  if (Array.isArray(data) && data.length === 0) {
    return [] as KeyValueItem<T>[]
  }

  if (data === undefined) {
    parentYMap.set(getterKey, [])
    return [] as KeyValueItem<T>[]
  }

  if (Array.isArray(data)) {
    // Have enough info to cast to the correct type
    const validatedData = [] as KeyValueItem<T>[]
    let beenFormatted = false

    data.forEach((rawItem) => {
      const validateResult = validateKeyValueItem<T>(rawItem, variant)
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

      return (validatedData as unknown as KeyValueItem<LocalValueKV>[]).map(
        (item) =>
          ({
            ...item,
            localValue: getLocalObject(item.localValue, workspaceId),
          } as KeyValueItem<LocalValueKV>)
      ) as unknown as KeyValueItem<T>[]
    }

    return validatedData
  }

  throw new Error(`Invalid data type for ${getterKey}`)
}

/** Retrieves a local object if it exists */
export const getLocalObject = <T>(
  localObject: LocalObject<T>,
  workspaceId: string
): LocalObject<T> => {
  const item = localStorage.getItem(
    `LocalObject:${workspaceId}-${localObject.localId}`
  )

  if (
    item === null ||
    item === undefined ||
    item === 'undefined' ||
    item === 'null'
  ) {
    return localObject
  }

  return {
    ...localObject,
    data: JSON.parse(item),
  }
}

export const kvExporter = <T extends KVVariantTypes>(
  items: KeyValueItem<T>[],
  variant: KeyValueItem<T>['variant'],
  workspaceId: string
): KeyValueItem<T>[] => {
  if (variant === 'localvalue') {
    return (items as unknown as KeyValueItem<LocalValueKV>[]).map((item) => ({
      ...item,
      localValue: setAndCleanLocalObject(item.localValue, workspaceId),
    })) as unknown as KeyValueItem<T>[]
  }

  return items
}

/** Stores an updated LocalObject in localStorage and cleans the data for storage
in the entity engine */
export const setAndCleanLocalObject = <T>(
  localObject: LocalObject<T>,
  workspaceId: string
): LocalObject<T> => {
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
