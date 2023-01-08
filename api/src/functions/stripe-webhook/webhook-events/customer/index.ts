import { z } from 'zod'

export const customerIdentificationSchema = z.object({
  variant: z.enum(['TEAM', 'USER']),
  variantTargetId: z.string(),
})
