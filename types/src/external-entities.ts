import { z } from 'zod'

export const storedObjectSchema = <T>(objectSchema: z.ZodType<T>) =>
  z.object({
    __typename: z.literal('StoredObject'),
    storeReceipt: z.string(),
    data: z.union<[z.ZodType<T>, z.ZodType<null>]>([objectSchema, z.null()]),
  })

export type StoredObject = z.infer<ReturnType<typeof storedObjectSchema>>

export const fileFieldTypeSchema = z.union([
  z.object({
    data: storedObjectSchema(z.string()),
    filename: z.string(),
  }),
  z.null(),
])

export type FileFieldType = z.infer<typeof fileFieldTypeSchema>

// export type FileFieldType = {
//   data: StoredObject<string | ArrayBuffer>
//   filename: string
// } | null

// export type StoredObject<T> = {
//   __typename: 'StoredObject'
//   storeReceipt: string
//   data: T | null
// }

export const localObjectSchema = <T>(objectSchema: z.ZodType<T>) =>
  z.object({
    __typename: z.literal('LocalObject'),
    localId: z.string().uuid(),
    data: z.union<[z.ZodType<T>, z.ZodType<null>]>([objectSchema, z.null()]),
  })

export type LocalObject = z.infer<ReturnType<typeof localObjectSchema>>

// export type LocalObject<T> = {
//   __typename: 'LocalObject'
//   localId: string
//   data: T | null
// }
