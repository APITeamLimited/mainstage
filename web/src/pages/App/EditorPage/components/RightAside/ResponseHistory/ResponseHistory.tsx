/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import type { Map as YMap } from 'yjs'

import { focusedElementVar, getFocusedElementKey } from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

import { CollectionResponseContext } from './contexts/CollectionResponseContext'
import { FolderResponseContext } from './contexts/FolderResponseContext'
import { RESTResponseContext } from './contexts/RESTResponseContext'
import { InnerResponseHistory } from './InnerResponseHistory'

type ResponseHistoryProps = {
  onCloseAside: () => void
  collectionYMap: YMap<any>
  includeAll?: boolean
}

export type FocusedHistoryTypename = 'Collection' | 'Folder' | 'RESTRequest'

export const ResponseHistory = ({
  onCloseAside,
  collectionYMap,
  includeAll,
}: ResponseHistoryProps) => {
  const focusedElementDict = useReactiveVar(focusedElementVar)

  const collectionHook = useYMap(collectionYMap)

  const focusedTypename = useMemo<null | FocusedHistoryTypename>(
    () => {
      const focusedElement =
        focusedElementDict[getFocusedElementKey(collectionYMap)]

      if (!focusedElement) {
        return null
      }

      const typename = focusedElement.get('__typename')

      if (
        typename === 'Collection' ||
        typename === 'Folder' ||
        typename === 'RESTRequest'
      ) {
        return typename
      }

      return null
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedElementDict, collectionHook]
  )

  const innerContent = useMemo(
    () => (
      <InnerResponseHistory
        onCloseAside={onCloseAside}
        collectionYMap={collectionYMap}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collectionHook, onCloseAside]
  )

  if (!focusedTypename) {
    return <></>
  }

  if (focusedTypename === 'RESTRequest') {
    return (
      <RESTResponseContext
        collectionYMap={collectionYMap}
        includeAll={includeAll}
      >
        {innerContent}
      </RESTResponseContext>
    )
  } else if (focusedTypename === 'Folder') {
    return (
      <FolderResponseContext
        collectionYMap={collectionYMap}
        includeAll={includeAll}
      >
        {innerContent}
      </FolderResponseContext>
    )
  }

  return (
    <CollectionResponseContext collectionYMap={collectionYMap}>
      {innerContent}
    </CollectionResponseContext>
  )
}
