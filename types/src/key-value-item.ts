/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'
import { z } from 'zod'

import {
  fileFieldTypeSchema,
  LocalObject,
  localObjectSchema,
} from './external-entities'

export const fileFieldKVSchema = z.union([
  z.object({
    variant: z.literal('filefield'),
    fileField: fileFieldTypeSchema,
    fileEnabled: z.literal(true),
  }),
  z.object({
    variant: z.literal('filefield'),
    fileEnabled: z.literal(false),
    value: z.string(),
  }),
])

export type FileFieldKV = z.infer<typeof fileFieldKVSchema>

// export type FileFieldKV =
//   | {
//       variant: 'filefield'
//       fileField: FileFieldType
//       fileEnabled: true
//     }
//   | {
//       variant: 'filefield'
//       fileEnabled: false
//       value: string
//     }

export const localValueKVSchema = z.object({
  variant: z.literal('localvalue'),
  value: z.string(),
  localValue: localObjectSchema(z.string()),
})

export type LocalValueKV = z.infer<typeof localValueKVSchema>

// export type LocalValueKV = {
//   variant: 'localvalue'
//   value: string
//   localValue: LocalObject<string>
// }

export const defaultKVSchema = z.object({
  variant: z.literal('default'),
  value: z.string(),
})

export type DefaultKV = z.infer<typeof defaultKVSchema>

// export type DefaultKV = {
//   variant: 'default'
//   value: string
// }

export const kvVariantTypesSchema = z.union([
  fileFieldKVSchema,
  localValueKVSchema,
  defaultKVSchema,
])

export type KVVariantTypes = z.infer<typeof kvVariantTypesSchema>

// export type KVVariantTypes = FileFieldKV | LocalValueKV | DefaultKV

export const keyValueItemSchema = <T extends KVVariantTypes>(
  variantSchema: z.ZodType<T>
) => {
  return z.intersection(
    z.object({
      id: z.number(),
      keyString: z.string(),
      enabled: z.boolean(),
    }),
    variantSchema
  )
}

export type KeyValueItem = z.infer<ReturnType<typeof keyValueItemSchema>>

// export type KeyValueItem<T extends KVVariantTypes> = {
//   id: number
//   keyString: string
//   enabled: boolean
// } & T

/**
 * Checks to ensure the keyvalue item is in the correct format
 */
export const validateKeyValueItem = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  variant: KeyValueItem['variant']
): {
  item: KeyValueItem
  changed: boolean
} | null => {
  const itemVariant = item?.variant

  if (variant === 'filefield') {
    if (itemVariant === 'filefield') {
      return { item: item as KeyValueItem, changed: false }
    } else if (itemVariant === undefined && typeof item.id === 'number') {
      const newItem: KeyValueItem = {
        id: item.id,
        keyString: item.keyString ?? '',
        enabled: item.enabled ?? true,
        variant: 'filefield',
        fileEnabled: false,
        value: item.value,
      }
      return { item: newItem as unknown as KeyValueItem, changed: true }
    } else {
      console.error(`Invalid itemVariant: ${itemVariant}`)
      return null
    }
  } else if (variant === 'localvalue') {
    if (itemVariant === 'localvalue') {
      return { item: item as KeyValueItem, changed: false }
    } else if (itemVariant === undefined && typeof item.id === 'number') {
      const newItem: KeyValueItem = {
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
      return { item: newItem as unknown as KeyValueItem, changed: true }
    } else {
      console.error(`Invalid itemVariant: ${itemVariant}`)
      return null
    }
  } else if (variant === 'default') {
    if (itemVariant === 'default') {
      return { item: item as KeyValueItem, changed: false }
    } else if (itemVariant === undefined && typeof item.id === 'number') {
      const newItem: KeyValueItem = {
        id: item.id,
        keyString: item.keyString ?? '',
        enabled: item.enabled ?? true,
        variant: 'default',
        value: item.value ?? '',
      }
      return { item: newItem as unknown as KeyValueItem, changed: true }
    } else {
      console.error(`Invalid itemVariant: ${itemVariant}`)
      return null
    }
  }

  console.error(`Invalid validator variant: ${variant}`)
  return null
}

export const kvLegacyImporter = (
  getterKey: string,
  parentYMap: YMap<any>,
  variant: KeyValueItem['variant']
): KeyValueItem[] => {
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

/** Retrieves a local object if it exists */
export const getLocalObject = (
  localObject: LocalObject,
  workspaceId: string
): LocalObject => {
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
