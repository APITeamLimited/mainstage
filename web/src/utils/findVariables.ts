import { KeyValueItem } from 'src/components/app/collectionEditor/KeyValueEditor'
import { LocalEnvironment } from 'src/contexts/reactives'

export const findVariablesInString = (
  environment: LocalEnvironment | null,
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

const bracesRegex = /{(.*?)}/

/**
 * Finds environment variables in a given KeyValueItem
 */
export const findEnvironmentVariables = (
  environment: LocalEnvironment | null,
  item: KeyValueItem
) => {
  const key = item.keyString
  const { value } = item

  // Find substrings that start and end with curly braces
  const keyMatches = key.match(bracesRegex) || []
  const valueMatches = value.match(bracesRegex) || []

  // Split value into an array of strings, divided by matches
  const keySubstrings = key
    .split(bracesRegex)
    ?.filter((keyMatch) => keyMatch !== '')

  const valueSubstrings = value
    .split(bracesRegex)
    ?.filter((valueMatch) => valueMatch !== '')

  const keyMatchesIndex = 0

  const keyParsed = keySubstrings
    .map((keySubstring) => {
      if (keyMatchesIndex >= keyMatches.length) {
        return keySubstring
      } else if (`{${keySubstring}}` === keyMatches[keyMatchesIndex]) {
        return findVariablesInString(environment, keySubstring)
      } else {
        return keySubstring
      }
    })
    .join('')

  const valueMatchesIndex = 0

  const valueParsed = valueSubstrings
    .map((valueSubstring) => {
      if (valueMatchesIndex >= valueMatches.length) {
        return valueSubstring
      } else if (`{${valueSubstring}}` === valueMatches[valueMatchesIndex]) {
        return findVariablesInString(environment, valueSubstring)
      } else {
        return valueSubstring
      }
    })
    .join('')

  return {
    key: keyParsed,
    value: valueParsed,
  }
}
