import { Environment } from 'types/src'

import { KeyValueItem } from 'src/components/app/collectionEditor/KeyValueEditor'

const findVariablesInString = (
  environment: Environment | null,
  subString: string
) => {
  let value: string | undefined = undefined

  environment?.variables.forEach((variable) => {
    if (variable.keyString === subString && variable.enabled) {
      value = variable.value
    }
  })

  if (value === undefined) {
    throw new Error(`Could not find variable ${subString}`)
  }

  return value
}

// Find multiple substrings with curly braces
const bracesRegex = /{(.*?)}/g

export const findEnvironmentVariablesKeyValueItem = (
  environment: Environment | null,
  item: KeyValueItem
) => ({
  key: findEnvironmentVariables(environment, item.keyString),
  value: findEnvironmentVariables(environment, item.value),
})

/**
 * Finds environment variables in a given KeyValueItem
 */
export const findEnvironmentVariables = (
  environment: Environment | null,
  target: string
) => {
  if (environment === null) {
    // No environment, no variables
    return target
  }

  // Find substrings that start and end with curly braces and get their index
  const matches = target.match(bracesRegex) || []

  // Split value into an array of strings, divided by matches
  const targetSubstrings = target
    .split(bracesRegex)
    ?.filter((match) => match !== '')

  let matchesIndex = 0

  return targetSubstrings
    .map((substring) => {
      if (matchesIndex >= matches.length) {
        return substring
      } else if (`{${substring}}` === matches[matchesIndex]) {
        matchesIndex++
        return findVariablesInString(environment, substring)
      } else {
        return substring
      }
    })
    .join('')
}
