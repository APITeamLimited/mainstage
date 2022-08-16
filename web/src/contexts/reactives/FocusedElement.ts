import { makeVar } from '@apollo/client'
import * as Y from 'yjs'

type FocusedElementDictionary = {
  [collectionId: string]: Y.Map<any>
}

export const focusedElementVar = makeVar<FocusedElementDictionary>({})
