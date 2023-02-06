import { TestData, WrappedExecutionParams } from '@apiteam/types/src'
import { Socket } from 'socket.io-client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { updateFocusedResponse } from 'src/contexts/focused-response'
import { FocusedElementDictionary } from 'src/contexts/reactives'

// Focuses on the right tab and response when a test is run
export const handleTestAutoFocus = (
  focusedResponseDict: FocusedElementDictionary,
  workspace: YDoc,
  socket: Socket,
  params: WrappedExecutionParams
) => {
  const testType = determineTestType(params.testData)

  if (testType === 'RESTRequest') {
    restAutoFocus(focusedResponseDict, workspace, socket, params)
  }
}

const restAutoFocus = (
  focusedResponseDict: FocusedElementDictionary,
  workspace: YDoc,
  socket: Socket,
  params: WrappedExecutionParams
) => {
  socket.on(
    'rest-create-response:success',
    async ({ responseId }: { responseId: string }) => {
      const tryFindResponse = async (count = 0): Promise<YMap<any>> => {
        const restResponseYMap = workspace
          .getMap<any>('projects')
          ?.get(params.projectId)
          ?.get('branches')
          ?.get(params.branchId)
          ?.get('collections')
          ?.get(params.collectionId)
          ?.get('restResponses')
          ?.get(responseId) as YMap<any>

        if (!restResponseYMap) {
          if (count >= 10) {
            console.log(
              `Couldn't find response with id ${responseId} after ${count} tries`
            )

            // TODO: Find a better way to handle this that doesnt involve just reloading the page
            window.location.reload()

            throw new Error(
              `Couldn't find response with id ${responseId} after ${count} tries`
            )
          }

          // Increasing backoff
          await new Promise((resolve) => setTimeout(resolve, (count + 1) * 100))
          return tryFindResponse(count + 1)
        }

        return restResponseYMap as YMap<any>
      }

      const restResponseYMap = await tryFindResponse()

      updateFocusedResponse(focusedResponseDict, restResponseYMap)
    }
  )
}

const determineTestType = (testData: TestData): 'RESTRequest' | null => {
  if (testData.rootNode.variant === 'httpRequest') {
    if (!('subVariant' in testData.rootNode)) {
      return null
    }

    if (testData.rootNode.subVariant === 'RESTRequest') {
      return 'RESTRequest'
    }
  }

  return null
}
