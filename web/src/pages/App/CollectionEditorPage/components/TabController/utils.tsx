/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Map as YMap } from 'yjs'

import { RESTInputPanel } from '../RESTInputPanel'
import { RESTResponsePanel } from '../RESTResponsePanel'

import type { OpenTab } from './TabController'

export const determineNewRestTab = ({
  restResponses,
  focusedElement,
  focusedRestResponse,
  collectionYMap,
  setObservedNeedsSave,
  orderingIndex,
  tabId,
}: {
  restResponses: YMap<any>[]
  focusedElement: YMap<any>
  focusedRestResponse: YMap<any> | undefined
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean) => void
  orderingIndex: number
  tabId: string
}) => {
  const bottomYMap = determineRestResponse({
    restResponses,
    focusedRestResponse,
    focusedElement,
  })

  const newOpenTab: OpenTab = {
    topYMap: focusedElement,
    topNode: (
      <RESTInputPanel
        requestYMap={focusedElement}
        collectionYMap={collectionYMap}
        setObservedNeedsSave={setObservedNeedsSave}
        tabId={tabId}
      />
    ),
    bottomYMap,
    bottomNode: <RESTResponsePanel responseYMap={bottomYMap ?? undefined} />,
    orderingIndex,
    tabId,
    lastSaveCheckpoint: Date.now(),
  }

  return newOpenTab
}

const determineRestResponse = ({
  focusedRestResponse,
  restResponses,
  focusedElement,
}: {
  focusedRestResponse: YMap<any> | undefined
  restResponses: YMap<any>[]
  focusedElement: YMap<any>
}): YMap<any> | null => {
  // If there is a focused rest response, and it is in the list of rest responses
  // for the focused rest request, then set the bottomYMap to the focused rest response
  if (focusedRestResponse) {
    return focusedRestResponse
  }

  // Else find the most recent rest response
  return restResponses
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
