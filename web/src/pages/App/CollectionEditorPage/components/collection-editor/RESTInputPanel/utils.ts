import { KeyValueItem } from '@apiteam/types'
import type { Doc as YDoc, Map as YMap } from 'yjs'

export const generatePathVariables = ({
  requestYMap,
  unsavedEndpoint,
  setUnsavedPathVariables,
}: {
  requestYMap: YMap<any>
  unsavedEndpoint: string
  setUnsavedPathVariables: (pathVariables: KeyValueItem[]) => void
}) => {
  const path = unsavedEndpoint.split('?')[0]
  const pathParts = path.split('/') as string[]

  if (pathParts.length === 1) return

  // Scan for path variables with colon after the slash
  const pathVariables: string[] = []

  pathParts.forEach((part) => {
    // Ignore empty parts
    if (part.startsWith(':')) {
      pathVariables.push(part.substring(1))
    }
  })

  if (pathVariables.length === 0) return

  // Ignore if already set in pathVariables else set
  const pathVariablesSet = new Set(
    pathVariables.filter((pathVariable) => pathVariable !== '')
  ) as Set<string>

  const newPathVariables = Array.from(pathVariablesSet).map(
    (pathVariable, index) => ({
      id: index,
      keyString: pathVariable,
      value: '',
      enabled: true,
    })
  )

  const rawExistingPathVariables = (requestYMap?.get('pathVariables') ??
    []) as KeyValueItem[]

  const existingPathVariables = [] as KeyValueItem[]

  // Remove any variables from existingPathVariables that are no longer in pathVariablesSet
  rawExistingPathVariables.forEach((existingPathVariable) => {
    if (pathVariablesSet.has(existingPathVariable.keyString)) {
      existingPathVariables.push(existingPathVariable)
    }
  })

  // Ensure newPathVariables are not already in existingPathVariables
  newPathVariables.forEach((newPathVariable) => {
    const existingPathVariable = existingPathVariables.find(
      (existingPathVariable) =>
        existingPathVariable.keyString === newPathVariable.keyString &&
        existingPathVariable.value !== ''
    )

    if (!existingPathVariable) {
      existingPathVariables.push(newPathVariable)
    }
  })

  // Ensure no duplicate keys
  const finalPathVariables = [] as KeyValueItem[]
  const pathVariableKeys = new Set() as Set<string>

  existingPathVariables.forEach((existingPathVariable) => {
    if (!pathVariableKeys.has(existingPathVariable.keyString)) {
      finalPathVariables.push(existingPathVariable)
      pathVariableKeys.add(existingPathVariable.keyString)
    }
  })

  requestYMap.set('pathVariables', finalPathVariables)
  setUnsavedPathVariables(finalPathVariables)
}
