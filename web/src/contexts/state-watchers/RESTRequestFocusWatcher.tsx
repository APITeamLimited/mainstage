/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'

import { useReactiveVar } from '@apollo/client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives'

import {
  clearFocusedRESTResponse,
  focusedResponseVar,
  updateFocusedRESTResponse,
} from '../focused-response'

type RESTRequestFocusWatcherProps = {
  collectionYMap: YMap<any>
}

export const RESTRequestFocusWatcher = ({
  collectionYMap,
}: RESTRequestFocusWatcherProps) => {
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const restResponsesYMap = collectionYMap.get('restResponses')
  const restRequestsYMap = collectionYMap.get('restRequests')
  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  // When focusing on a response, also focus on the request that generated it
  useEffect(() => {
    const focusedResponse = focusedResponseDict[
      getFocusedElementKey(collectionYMap)
    ] as YMap<any> | undefined

    if (!focusedResponse) {
      return
    }

    const restRequest = restRequestsYMap.get(
      focusedResponse.get('parentId')
    ) as YMap<any>

    if (!restRequest) {
      throw `restRequest not found for responseId: ${focusedResponse.get(
        'parentId'
      )}`
    }

    updateFocusedElement(focusedElementDict, restRequest)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponseDict])

  // When focusing on a request, set the focused response to the latest response
  useEffect(() => {
    const focusedRequest = focusedElementDict[
      getFocusedElementKey(collectionYMap)
    ] as YMap<any> | undefined

    if (!focusedRequest) {
      return
    }

    const focusedResponse = focusedResponseDict[
      getFocusedElementKey(collectionYMap)
    ] as YMap<any> | undefined

    if (focusedRequest.get('__typename') !== 'RESTRequest' && focusedResponse) {
      clearFocusedRESTResponse(focusedResponseDict, focusedResponse)
      return
    }

    // If already focused on a response for this request, don't do anything
    if (
      focusedResponse &&
      focusedResponse.get('parentId') === focusedRequest.get('id')
    ) {
      return
    }

    const latestResponse = Array.from(restResponsesYMap.values() as YMap<any>[])
      .filter(
        (response) => response?.get('parentId') === focusedRequest.get('id')
      )
      .sort((a, b) => b.get('createdAt') - a.get('createdAt'))[0] as
      | YMap<any>
      | undefined

    if (!latestResponse) {
      if (!focusedResponse) return
      clearFocusedRESTResponse(focusedResponseDict, focusedResponse)
      return
    }

    if (focusedResponse?.get('id') === latestResponse.get('id')) return

    updateFocusedRESTResponse(focusedResponseDict, latestResponse)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedElementDict])

  return <></>
}
