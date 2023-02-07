import { z } from 'zod'

export const EXECUTION_AGENTS = ['Default', 'Cloud', 'Local'] as const

export const executionOptionsSchema = z.object({
  executionAgent: z.enum(EXECUTION_AGENTS),
})

export type ExecutionOptions = z.infer<typeof executionOptionsSchema>

export const DEFAULT_EXECUTION_OPTIONS: ExecutionOptions = {
  executionAgent: 'Default',
}
