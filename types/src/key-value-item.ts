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
  variant: T['variant']
): {
  item: KeyValueItem<T>
  changed: boolean
} => {
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
      throw new Error(`Invalid itemVariant: ${itemVariant}`)
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
      console.log('Item', item)
      throw new Error(`Invalid itemVariant: ${itemVariant}`)
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
      throw new Error(`Invalid itemVariant: ${itemVariant}`)
    }
  }

  throw new Error(`Invalid validator variant: ${variant}`)
}

export const kvLegacyImporter = <T extends KVVariantTypes>(
  getterKey: string,
  parentYMap: YMap<any>,
  variant: T['variant']
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
      const { item, changed } = validateKeyValueItem<T>(rawItem, variant)

      if (changed) {
        beenFormatted = true
      }

      validatedData.push(item)
    })

    if (beenFormatted) {
      parentYMap.set(getterKey, validatedData)
    }

    return validatedData
  }

  throw new Error(`Invalid data type for ${getterKey}`)
}
