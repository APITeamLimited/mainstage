import { z } from 'zod'

import { isoStringRegex } from '../type-utils'

export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().regex(isoStringRegex),
  updatedAt: z.union([z.string().regex(isoStringRegex), z.null()]),
})

export interface BaseEntity {
  id: string
  __typename: string
  createdAt: Date
  updatedAt: Date | null
}
