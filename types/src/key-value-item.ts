/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'
import { z } from 'zod'

import { fileFieldTypeSchema, localObjectSchema } from './external-entities'

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

export type DefaultKeyValueItem = KeyValueItem & DefaultKV
export type FileFieldKeyValueItem = KeyValueItem & FileFieldKV
export type LocalValueKeyValueItem = KeyValueItem & LocalValueKV

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
