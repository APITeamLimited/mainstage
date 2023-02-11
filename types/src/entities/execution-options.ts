import { z } from 'zod'
export const EXECUTION_AGENTS = ['Default', 'Cloud', 'Local'] as const

export const REQEUST_BODY_COMPRESSIONS = [
  'none',
  'gzip',
  'deflate',
  'br',
  'zstd',
] as const

export const maxRedirectsSchema = z.number().min(0).max(100)

export const executionOptionsSchema = z.object({
  executionAgent: z.enum(EXECUTION_AGENTS),
  maxRedirects: maxRedirectsSchema,
  timeoutMilliseconds: z
    .number()
    .min(0)
    .max(1000 * 60 * 5),
  compression: z.enum(REQEUST_BODY_COMPRESSIONS),
})

export type ExecutionOptions = z.infer<typeof executionOptionsSchema>

export const DEFAULT_EXECUTION_OPTIONS: ExecutionOptions = {
  executionAgent: 'Default',
  maxRedirects: 10,
  timeoutMilliseconds: 1000 * 60,
  compression: 'none',
}

/** Gets execution options and overrides with defaults if a field doesn't exist
 * to be used in case new fields are added
 */
export const safeGetExecutionOptions = (
  rawExecutionOptions: Record<string, unknown>
): ExecutionOptions => {
  let executionOptions = DEFAULT_EXECUTION_OPTIONS

  // Override with user options
  if (rawExecutionOptions) {
    executionOptions = {
      ...executionOptions,
      ...rawExecutionOptions,
    }
  }

  return executionOptions
}
