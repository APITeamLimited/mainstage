import { ExecutionParams } from '@apiteam/types'
import { ParsedQuery } from 'query-string'

const keysToValidate = [
  'source',
  'sourceName',
  'scopeId',
  'environmentContext',
] as const

export const validateParams = (
  params: ParsedQuery<string>
): ExecutionParams => {
  // Ensure no params are arrays
  keysToValidate.forEach((key) => {
    if (Array.isArray(params[key])) {
      throw new Error(`Invalid ${key} parameter must be a string`)
    }
  })

  keysToValidate.forEach((key) => {
    if (!params[key]) {
      throw new Error(`Missing ${key} parameter`)
    }
  })

  keysToValidate.forEach((key) => {
    if (typeof params[key] !== 'string') {
      throw new Error(`Invalid ${key} parameter must be a string`)
    }
  })

  const environmentContext = JSON.parse(
    params.environmentContext as string
  ) as unknown

  if (!Array.isArray(environmentContext)) {
    throw new Error('Invalid environmentContext parameter must be an array')
  }

  const checkedEnvironmentContext = environmentContext.map((item) => {
    if (typeof item !== 'object') {
      throw new Error(
        'Invalid environmentContext parameter must be an array of KeyValueItems'
      )
    }

    if (typeof item.key !== 'string') {
      throw new Error(
        'Item key in environmentContext parameter must be a string'
      )
    }

    if (typeof item.value !== 'string') {
      throw new Error(
        'Item value in environmentContext parameter must be a string'
      )
    }

    return item as {
      key: string
      value: string
    }
  })

  // Sufficiently checked for strings so we can cast
  return {
    source: params.source as string,
    sourceName: params.sourceName as string,
    scopeId: params.scopeId as string,
    environmentContext: checkedEnvironmentContext,
    collectionContext: null,
  }
}
