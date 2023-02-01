import { createContext, useContext } from 'react'

import type { Doc as YDoc } from 'yjs'

import { useYMap } from 'src/lib/zustand-yjs'

import { PossibleSyncStatus } from './utils'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DocContext = createContext<YDoc>(null)
export const useWorkspace = () => useContext(DocContext)

export const DocProviderGuard = ({
  doc,
  children,
  socketioSyncStatus,
}: {
  doc: YDoc | null
  children: React.ReactNode
  socketioSyncStatus: PossibleSyncStatus
}) => {
  if (
    !doc ||
    (socketioSyncStatus !== 'connected' && socketioSyncStatus !== 'connecting')
  ) {
    return <></>
  }

  return <InnerDocProviderGuard doc={doc}>{children}</InnerDocProviderGuard>
}

const InnerDocProviderGuard = ({
  doc,
  children,
}: {
  doc: YDoc
  children: React.ReactNode
}) => {
  const metaMap = doc.getMap('meta')
  useYMap(metaMap)

  const ready = doc !== null //&&
  //doc.isLoaded &&
  //doc.getMap('meta')?.get('performedFirstRun') === true

  if (!ready) return <></>

  return <DocContext.Provider value={doc}>{children}</DocContext.Provider>
}
