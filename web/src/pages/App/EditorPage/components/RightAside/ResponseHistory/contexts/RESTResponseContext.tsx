import { useCallback, useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import type { Map as YMap } from 'yjs'

import { useTestCancel } from 'src/contexts/cancel-running-test-provider'
import {
  clearFocusedResponse,
  focusedResponseVar,
  updateFocusedResponse,
} from 'src/contexts/focused-response'
import { useYJSModule } from 'src/contexts/imports'
import { focusedElementVar, getFocusedElementKey } from 'src/contexts/reactives'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { getOrCreateSubYMap } from 'src/utils/get-or-create-sub-ymap'

import { GroupedResponseContext, groupResponses } from '../grouped-responses'

type RESTResponseContextProps = {
  children?: React.ReactNode
  collectionYMap: YMap<any>
  includeAll?: boolean
}

export const RESTResponseContext = ({
  children,
  collectionYMap,
  includeAll,
}: RESTResponseContextProps) => {
  const Y = useYJSModule()

  const cancelRunningTest = useTestCancel()
  const workspaceInfo = useWorkspaceInfo()
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  const historyYMap = getOrCreateSubYMap(Y, collectionYMap, 'restResponses')
  const historyHook = useYMap(historyYMap)
  const collectionHook = useYMap(collectionYMap)

  const groupedResponses = useMemo(() => {
    const parentId =
      focusedElementDict[getFocusedElementKey(collectionYMap)]?.get('id')

    const responses: YMap<any>[] = (
      Array.from(historyYMap.values()) as YMap<any>[]
    ).filter((response) => {
      const baseCondition =
        response.get('__subtype') === 'SuccessSingleResult' ||
        response.get('__subtype') === 'FailureResult' ||
        response.get('__subtype') === 'LoadingResponse' ||
        response.get('__subtype') === 'SuccessMultipleResult'

      return includeAll
        ? baseCondition
        : baseCondition && response.get('parentId') === parentId
    })

    return groupResponses(responses)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyHook, collectionHook, focusedElementDict])

  const handleDeleteResponse = useCallback(
    (responseId: string) => {
      const restResponse = historyYMap.get(responseId) as YMap<any>

      // If response is for a running request, cancel the request
      if (restResponse.get('__subtype') === 'LoadingResponse') {
        cancelRunningTest?.(
          workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
          restResponse.get('jobId'),
          restResponse.get('executionAgent'),
          restResponse.get('localJobId')
        )
      }

      clearFocusedResponse(focusedElementDict, restResponse)

      const focusedRequestId = focusedElementDict[
        getFocusedElementKey(collectionYMap)
      ]?.get('id') as string | undefined

      if (!focusedRequestId) {
        return
      }

      // Set focused response to the next most recent response
      const responses = (Array.from(historyYMap.values()) as YMap<any>[])
        .filter((response) => response.get('parentId') === focusedRequestId)
        .sort((a, b) => {
          const aDate = new Date(a.get('createdAt'))
          const bDate = new Date(b.get('createdAt'))
          return bDate.getTime() - aDate.getTime()
        })

      if (responses.length > 0) {
        updateFocusedResponse(focusedResponseDict, responses[0])
      }

      historyYMap.delete(responseId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cancelRunningTest,
      collectionHook,
      focusedElementDict,
      focusedResponseDict,
      historyHook,
      workspaceInfo.isTeam,
      workspaceInfo.scope.variantTargetId,
    ]
  )

  const handleDeleteAllResponses = useCallback(() => {
    clearFocusedResponse(focusedElementDict, collectionYMap)

    Object.values(groupedResponses).forEach((responses) =>
      responses.forEach((responseYMap) => {
        if (responseYMap.get('__subtype') === 'LoadingResponse') {
          cancelRunningTest?.(
            workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
            responseYMap.get('jobId'),
            responseYMap.get('executionAgent'),
            responseYMap.get('localJobId')
          )
        }
        historyYMap.delete(responseYMap.get('id'))
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cancelRunningTest,
    collectionHook,
    focusedElementDict,
    groupedResponses,
    historyHook,
  ])

  const context = useMemo(
    () => ({
      groupedResponses,
      handleDeleteResponse,
      handleDeleteAllResponses,
    }),
    [groupedResponses, handleDeleteAllResponses, handleDeleteResponse]
  )

  return (
    <GroupedResponseContext.Provider value={context}>
      {children}
    </GroupedResponseContext.Provider>
  )
}
