import { ResolvedVariable } from '@apiteam/types'
import * as Y from 'yjs'

import { KeyValueItem } from 'src/components/app/collection-editor/KeyValueEditor'
import {
  BRACED_REGEX,
  getPossibleVariableMatch,
} from 'src/components/app/EnvironmentManager/EnvironmentTextField/VariablePlugin'

export const findVariablesInString = (
  environment: Y.Map<any> | null,
  collection: Y.Map<any> | null,
  subString: string
): ResolvedVariable => {
  for (const variable of (environment?.get('variables') ??
    []) as KeyValueItem[]) {
    if (variable.keyString === subString && variable.enabled) {
      return {
        sourceName: environment?.get('name'),
        sourceTypename: 'Environment',
        value: variable.value,
      }
    }
  }

  for (const variable of (collection?.get('variables') ??
    []) as KeyValueItem[]) {
    if (variable.keyString === subString && variable.enabled) {
      return {
        sourceName: collection?.get('name'),
        sourceTypename: 'Collection',
        value: variable.value,
      }
    }
  }

  return null
}

export const findEnvironmentVariablesKeyValueItem = (
  environment: Y.Map<any> | null,
  collection: Y.Map<any> | null,
  item: KeyValueItem
) => ({
  key: findEnvironmentVariables(environment, collection, item.keyString),
  value: findEnvironmentVariables(environment, collection, item.value),
})

/**
 * Finds environment variables in a given KeyValueItem
 */
export const findEnvironmentVariables = (
  environment: Y.Map<any> | null,
  collection: Y.Map<any> | null,
  target: string
) => {
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
        findVariablesInString(environment, collection, variable)?.value ?? ''
      )
    } else {
      result.push(subString)
    }
  })

  return result.join('')
}
