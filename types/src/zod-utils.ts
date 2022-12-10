import type { ZodError } from 'zod'

export const prettyZodError = <T>(zodError: ZodError<T>) =>
  new Error(
    `Invalid data format: ${zodError.issues[0].path} ${zodError.issues[0].message}`
  )
