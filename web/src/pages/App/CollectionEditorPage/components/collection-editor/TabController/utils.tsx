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
}: {
  restResponses: YMap<any>[]
  focusedElement: YMap<any>
  focusedRestResponse: YMap<any> | undefined
  collectionYMap: YMap<any>
}) => {
  const bottomYMap = determineRestResponse({
    restResponses,
    focusedRestResponse,
  })

  const newOpenTab: OpenTab = {
    topYMap: focusedElement,
    topNode: (
      <RESTInputPanel
        requestYMap={focusedElement}
        collectionYMap={collectionYMap}
      />
    ),
    bottomYMap,
    bottomNode: <RESTResponsePanel responseYMap={bottomYMap ?? undefined} />,
  }

  return newOpenTab
}

const determineRestResponse = ({
  focusedRestResponse,
  restResponses,
}: {
  focusedRestResponse: YMap<any> | undefined
  restResponses: YMap<any>[]
}): YMap<any> | null => {
  // If there is a focused rest response, and it is in the list of rest responses
  // for the focused rest request, then set the bottomYMap to the focused rest response
  if (focusedRestResponse) {
    return focusedRestResponse
  }

  // Else find the most recent rest response
  return restResponses.reduce((mostRecent, restRequest) => {
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
