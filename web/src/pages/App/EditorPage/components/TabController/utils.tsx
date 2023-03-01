/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from '@mui/material'
import { ErrorBoundary } from 'react-error-boundary'
import type { Map as YMap } from 'yjs'

import { CollectionInputPanel } from '../panels/CollectionInputPanel'
import { ErrorPanel } from '../panels/ErrorPanel'
import { FolderInputPanel } from '../panels/FolderInputPanel'
import { ResponsePanel } from '../panels/ResponsePanel'
import { RESTInputPanel } from '../panels/RESTInputPanel'

import type { OpenTab } from './TabController'

export const determineNewCollectionResponseTab = ({
  collectionResponses,
  focusedElement,
  focusedResponse,
  setObservedNeedsSave,
  orderingIndex,
  tabId,
}: {
  collectionResponses: YMap<any>[]
  focusedElement: YMap<any>
  focusedResponse: YMap<any> | undefined
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
  orderingIndex: number
  tabId: string
}) => {
  const bottomYMap = determineResponse({
    responseYMaps: collectionResponses,
    focusedResponse,
    focusedElement,
  })

  const newOpenTab: OpenTab = {
    topYMap: focusedElement,
    topNode: (
      <ErrorBoundary FallbackComponent={ErrorPanel}>
        <CollectionInputPanel
          collectionYMap={focusedElement}
          setObservedNeedsSave={setObservedNeedsSave}
        />
      </ErrorBoundary>
    ),
    bottomYMap,
    bottomNode: (
      <ErrorBoundary FallbackComponent={ErrorPanel}>
        <ResponsePanel
          responseYMap={bottomYMap ?? undefined}
          parentTypename="Collection"
        />
      </ErrorBoundary>
    ),
    orderingIndex,
    tabId,
    lastSaveCheckpoint: Date.now(),
  }

  return newOpenTab
}

export const determineNewFolderResponseTab = ({
  folderResponses,
  focusedElement,
  focusedResponse,
  collectionYMap,
  setObservedNeedsSave,
  orderingIndex,
  tabId,
}: {
  folderResponses: YMap<any>[]
  focusedElement: YMap<any>
  focusedResponse: YMap<any> | undefined
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
  orderingIndex: number
  tabId: string
}) => {
  const bottomYMap = determineResponse({
    responseYMaps: folderResponses,
    focusedResponse,
    focusedElement,
  })

  const newOpenTab: OpenTab = {
    topYMap: focusedElement,
    topNode: (
      <ErrorBoundary FallbackComponent={ErrorPanel}>
        <FolderInputPanel
          folderId={focusedElement.get('id')}
          collectionYMap={collectionYMap}
          setObservedNeedsSave={setObservedNeedsSave}
        />
      </ErrorBoundary>
    ),
    bottomYMap,
    bottomNode: (
      <ErrorBoundary FallbackComponent={ErrorPanel}>
        <ResponsePanel
          responseYMap={bottomYMap ?? undefined}
          parentTypename="Folder"
        />
      </ErrorBoundary>
    ),
    orderingIndex,
    tabId,
    lastSaveCheckpoint: Date.now(),
  }

  return newOpenTab
}

export const determineNewRESTResponseTab = ({
  restResponses,
  focusedElement,
  focusedResponse,
  collectionYMap,
  setObservedNeedsSave,
  orderingIndex,
  tabId,
}: {
  restResponses: YMap<any>[]
  focusedElement: YMap<any>
  focusedResponse: YMap<any> | undefined
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
  orderingIndex: number
  tabId: string
}) => {
  const bottomYMap = determineResponse({
    responseYMaps: restResponses,
    focusedResponse,
    focusedElement,
  })

  const newOpenTab: OpenTab = {
    topYMap: focusedElement,
    topNode: (
      <ErrorBoundary FallbackComponent={ErrorPanel}>
        <RESTInputPanel
          requestYMap={focusedElement}
          collectionYMap={collectionYMap}
          setObservedNeedsSave={setObservedNeedsSave}
        />
      </ErrorBoundary>
    ),
    bottomYMap,
    bottomNode: (
      <ErrorBoundary FallbackComponent={ErrorPanel}>
        <ResponsePanel
          responseYMap={bottomYMap ?? undefined}
          parentTypename="RESTRequest"
        />
      </ErrorBoundary>
    ),
    orderingIndex,
    tabId,
    lastSaveCheckpoint: Date.now(),
  }

  return newOpenTab
}

const determineResponse = ({
  focusedResponse,
  responseYMaps,
  focusedElement,
}: {
  focusedResponse: YMap<any> | undefined
  responseYMaps: YMap<any>[]
  focusedElement: YMap<any>
}): YMap<any> | null => {
  // If there is a focused response, and it is in the list of rest responses
  // for the focused request, then set the bottomYMap to the focused rest response
  if (focusedResponse) {
    return focusedResponse
  }

  // Else find the most recent response
  return responseYMaps
    .filter((response) => response.get('parentId') === focusedElement.get('id'))
    .reduce((mostRecent, restRequest) => {
      if (
        !mostRecent ||
        new Date(restRequest.get('createdAt')) >
          new Date(mostRecent.get('createdAt'))
      ) {
        return restRequest
      }

      return mostRecent
    }, null as YMap<any> | null)
}
