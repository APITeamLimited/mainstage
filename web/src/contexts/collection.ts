import { createContext, useContext } from 'react'

import type { Doc as YDoc, Map as YMap } from 'yjs'

export const CollectionContext = createContext<YMap<any> | null>(null)
export const useCollection = () => useContext(CollectionContext)
