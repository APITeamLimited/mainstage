/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeVar } from '@apollo/client'
import * as Y from 'yjs'

import {
  getFocusedElementKey,
  FocusedElementDictionary,
} from 'src/contexts/reactives'

export * from './RESTResponsePanel'

export const focusedResponseVar = makeVar<FocusedElementDictionary>({})

export const updateFocusedRESTResponse = (
  focusedResponseDict: FocusedElementDictionary,
  focusYMap: Y.Map<any>
) => {
  const newName = getFocusedElementKey(focusYMap)

  focusedResponseVar({
    ...focusedResponseDict,
    [newName]: focusYMap,
  })
}

export const clearFocusedRESTResponse = (
  focusedResponseDict: FocusedElementDictionary,
  originalFocusYMap: Y.Map<any>
) => {
  const newName = getFocusedElementKey(originalFocusYMap)

  const newFocusedResponseDict = { ...focusedResponseDict }
  delete newFocusedResponseDict[newName]

  focusedResponseVar(newFocusedResponseDict)
}
