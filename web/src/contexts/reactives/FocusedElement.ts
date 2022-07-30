import { makeVar } from '@apollo/client'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

type FocusedElementDictionary = {
  [collectionId: string]: Y.Map<any>
}

export const focusedElementVar = makeVar<FocusedElementDictionary>({})
