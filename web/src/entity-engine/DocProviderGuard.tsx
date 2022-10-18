import { createContext, useContext } from 'react'

import type { Doc as YDoc } from 'yjs'

const DocContext = createContext<YDoc | null>(null)
export const useWorkspace = () => useContext(DocContext)

type DocProviderGuardProps = {
  doc: YDoc | null
  children: React.ReactNode
}

export const DocProviderGuard = ({ doc, children }: DocProviderGuardProps) => {
  if (!doc) {
    return null
  }

  return <DocContext.Provider value={doc}>{children}</DocContext.Provider>
}
