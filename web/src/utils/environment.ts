/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionParams,
  FileFieldKV,
  FinalVariable,
  getLocalObject,
  KeyValueItem,
  KVVariantTypes,
  LocalValueKV,
  ResolvedVariable,
} from '@apiteam/types/src'
import type { Map as YMap } from 'yjs'

import {
  BRACED_REGEX,
  getPossibleVariableMatch,
} from 'src/components/app/EnvironmentManager/EnvironmentTextField/VariablePlugin'

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

export const findEnvironmentVariablesKeyValueItem = <T extends KVVariantTypes>(
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  item: KeyValueItem<T>,
  variant: KeyValueItem<T>['variant'],
  workspaceId: string
) => {
  if (variant === 'filefield') {
    if ((item as KeyValueItem<FileFieldKV>).fileEnabled) {
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
          (item as KeyValueItem<FileFieldKV>).value ?? ''
        ),
      }
    }
  } else if (variant === 'localvalue') {
    const localItem = {
      ...item,
      localValue: getLocalObject(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        item.localValue,
        workspaceId
      ),
    } as KeyValueItem<LocalValueKV>

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

export const createEnvironmentContext = (
  environmentOrCollection: YMap<any>,
  workspaceId: string
): {
  name: string
  variables: FinalVariable[]
} | null => {
  const rawVariables = (
    (environmentOrCollection?.get('variables') ??
      []) as KeyValueItem<LocalValueKV>[]
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
