import { makeVar } from '@apollo/client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { FocusedElementDictionary, getFocusedElementKey } from './reactives'

export const focusedResponseVar = makeVar<FocusedElementDictionary>({})

export const updateFocusedRESTResponse = (
  focusedResponseDict: FocusedElementDictionary,
  focusYMap: YMap<any>
) => {
  const newName = getFocusedElementKey(focusYMap)

  focusedResponseVar({
    ...focusedResponseDict,
    [newName]: focusYMap,
  })
}

export const clearFocusedRESTResponse = (
  focusedResponseDict: FocusedElementDictionary,
  originalFocusYMap: YMap<any>
) => {
  const newName = getFocusedElementKey(originalFocusYMap)

  const newFocusedResponseDict = { ...focusedResponseDict }
  delete newFocusedResponseDict[newName]

  focusedResponseVar(newFocusedResponseDict)
}
