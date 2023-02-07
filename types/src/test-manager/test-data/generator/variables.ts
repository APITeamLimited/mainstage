/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig } from 'axios'
import type { Map as YMap } from 'yjs'
import { z } from 'zod'

import type { ExecutionParams, FinalVariable } from '../../../execution-params'
import type { LocalObject } from '../../../external-entities'
import type {
  KeyValueItem,
  LocalValueKeyValueItem,
} from '../../../key-value-item'

export type VariableMatch = {
  leadOffset: number
  matchingString: string
}

export const BRACED_REGEX = /{{(([^}][^}]?|[^}]}?)*)}}/g

// Checks input text for @value matches
export function getPossibleVariableMatch(text: string): VariableMatch[] {
  // Will need to change this bit to match custom regex
  const matches = Array.from(text.matchAll(BRACED_REGEX))

  const filteredMatches = matches.filter(
    (match) => match.index !== undefined && match[1].length > 0
  ) as (RegExpMatchArray & { index: number })[]

  return filteredMatches.map((match) => ({
    leadOffset: match.index,
    matchingString: match[0],
  }))
}

const resolvedVariable = z.union([
  z.object({
    sourceName: z.string(),
    sourceTypename: z.enum(['Collection', 'Environment']),
    value: z.string(),
  }),
  z.null(),
])

export type ResolvedVariable = z.infer<typeof resolvedVariable>

export const findVariablesInString = (
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  subString: string
): ResolvedVariable => {
  // Check collection context first

  if (collectionContext) {
    for (const variable of collectionContext.variables) {
      if (variable.key === subString) {
        return {
          sourceName: collectionContext.name,
          sourceTypename: 'Collection',
          value: variable.value,
        }
      }
    }
  }

  if (environmentContext) {
    for (const variable of environmentContext.variables) {
      if (variable.key === subString) {
        return {
          sourceName: environmentContext.name,
          sourceTypename: 'Environment',
          value: variable.value,
        }
      }
    }
  }

  return null
}

/**
 * Finds environment variables in a given KeyValueItem
 */
export const findEnvironmentVariables = (
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  target: string
): string => {
  // Find substrings that start and end with curly braces and get their index
  const matches = getPossibleVariableMatch(target)

  const offsets = [] as number[]

  matches.forEach((match) => {
    if (!offsets.includes(match.leadOffset)) {
      offsets.push(match.leadOffset)
    }
    if (!offsets.includes(match.leadOffset + match.matchingString.length)) {
      offsets.push(match.leadOffset + match.matchingString.length)
    }
  })

  offsets.push(target.length)

  // Split target at the offsets

  const splitStrings = [] as string[]

  let lastOffset = 0

  offsets.forEach((offset) => {
    splitStrings.push(target.substring(lastOffset, offset))
    lastOffset = offset
  })

  // Find variables in the substrings
  const result = [] as string[]
  splitStrings.forEach((subString) => {
    if (BRACED_REGEX.test(subString)) {
      // Remove curly {{}} braces
      const variable = subString.substring(2, subString.length - 2)

      result.push(
        findVariablesInString(environmentContext, collectionContext, variable)
          ?.value ?? ''
      )
    } else {
      result.push(subString)
    }
  })

  return result.join('')
}

export const findEnvironmentVariablesKeyValueItem = (
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  item: KeyValueItem,
  variant: KeyValueItem['variant'],
  workspaceId: string
) => {
  if (variant === 'filefield' && item.variant === 'filefield') {
    if (item.fileEnabled) {
      return item
    } else {
      return {
        key: findEnvironmentVariables(
          environmentContext,
          collectionContext,
          item.keyString
        ),
        value: findEnvironmentVariables(
          environmentContext,
          collectionContext,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (item as KeyValueItem).value ?? ''
        ),
      }
    }
  } else if (variant === 'localvalue' && item.variant === 'localvalue') {
    const localItem = {
      ...item,
      localValue: getLocalObject(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        item.localValue,
        workspaceId
      ),
    } as LocalValueKeyValueItem

    const validLocalValue =
      typeof localItem.localValue?.data === 'string' &&
      localItem.localValue?.data.length > 0

    const usedValue = validLocalValue
      ? (localItem.localValue?.data as string)
      : localItem.value ?? ''

    return {
      key: findEnvironmentVariables(
        environmentContext,
        collectionContext,
        localItem.keyString
      ),
      value: findEnvironmentVariables(
        environmentContext,
        collectionContext,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        usedValue
      ),
    }
  } else if (variant === 'default') {
    return {
      key: findEnvironmentVariables(
        environmentContext,
        collectionContext,
        item.keyString
      ),
      value: findEnvironmentVariables(
        environmentContext,
        collectionContext,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        item.value ?? ''
      ),
    }
  } else {
    throw new Error(`Unknown key value variant ${variant}`)
  }
}

/** Retrieves a local object if it exists, backend safe */
export const getLocalObject = (
  localObject: LocalObject,
  workspaceId: string
): LocalObject => {
  // Also run on backend so need to check for this
  if (typeof localObject !== 'object') {
    return localObject
  }

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

export const createEnvironmentContext = (
  environmentOrCollection: YMap<any>,
  workspaceId: string
): {
  name: string
  variables: FinalVariable[]
} | null => {
  const rawVariables = (
    (environmentOrCollection?.get('variables') ??
      []) as LocalValueKeyValueItem[]
  )
    .map((variable) => ({
      ...variable,
      localValue: getLocalObject(variable.localValue, workspaceId),
    }))
    .filter((variable) => variable.enabled)

  const variables = [] as {
    key: string
    value: string
  }[]

  rawVariables.forEach((variable) => {
    const validLocalValue =
      typeof variable.localValue?.data === 'string' &&
      variable.localValue?.data.length > 0

    const usedValue = validLocalValue
      ? (variable.localValue?.data as string)
      : variable.value ?? ''

    // Variables can't contains variables themselves, so we don't need to check for them
    if (usedValue.length > 0) {
      variables.push({
        key: variable.keyString,
        value: usedValue,
      })
    }
  })

  if (!environmentOrCollection?.get('name')) {
    return null
  }

  return {
    name: environmentOrCollection?.get('name') ?? '',
    variables,
  }
}

/* Substitutes environment variables where possible in an axios request config */
export const makeEnvironmentAwareRequest = (
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  config: AxiosRequestConfig,
  skipBody: boolean
): AxiosRequestConfig => {
  return {
    ...config,

    url: findEnvironmentVariables(
      environmentContext,
      collectionContext,
      config.url ?? ''
    ),

    // Search for environment variables in header keys and values
    headers: Object.entries(config.headers || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(environmentContext, collectionContext, key)]:
          findEnvironmentVariables(
            environmentContext,
            collectionContext,
            String(value)
          ),
      }),
      {}
    ),

    // Search for environment variables in params keys and values
    params: Object.entries(config.params || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [findEnvironmentVariables(environmentContext, collectionContext, key)]:
          findEnvironmentVariables(
            environmentContext,
            collectionContext,
            String(value)
          ),
      }),
      {}
    ),

    data:
      config.data && !skipBody
        ? findEnvironmentVariables(
            environmentContext,
            collectionContext,
            config.data
          )
        : null,
  }
}
