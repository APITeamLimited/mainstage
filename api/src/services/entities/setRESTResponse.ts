import { ScopeVariant } from 'types/graphql'
import { RESTResponse } from 'types/src'
import * as Y from 'yjs'

import { validateWith } from '@redwoodjs/api'

import { getScope } from 'src/lib/scope'
import { getOpenDoc, persistenceProvider } from 'src/lib/yjs'

import { checkInternal } from '../check-internal'
import { checkBearerScope } from '../checkBearerScope'

export const setRESTResponse = async ({
  token,
  scopeId,
  internalAPIKey,
  restResponse,
  projectId,
  branchId,
}: {
  token: string
  scopeId: string
  restResponse: RESTResponse
  projectId: string
  branchId: string
  internalAPIKey: string
}) => {
  validateWith(() => checkInternal(internalAPIKey))
  validateWith(() => checkBearerScope(token, scopeId))

  const scope = await getScope(scopeId)

  const doc = getOpenDoc({
    ...scope,
    createdAt: scope.createdAt.toISOString(),
    updatedAt: scope.updatedAt?.toISOString(),
    variant: scope.variant as ScopeVariant,
  })

  persistenceProvider.bindState(scopeId, doc)

  const tryAndSet = async (tries: number): Promise<boolean> => {
    const projectsFolder = doc.getMap('projects') as Y.Map<unknown>
    const projectYMap = projectsFolder.get(projectId) as Y.Map<unknown>

    // Check if project yMap contains branch yMap
    const branchesYMap = projectYMap.get('branches') as Y.Map<unknown>
    const branchYMap = branchesYMap.get(branchId) as Y.Map<unknown>

    if (!branchYMap.has('restResponses')) {
      if (tries >= 10) {
        throw new Error('Could not set restResponse')
      }
      await new Promise((r) => setTimeout(r, 100))
      return tryAndSet(tries + 1)
    }

    const restResponsesYMap = branchYMap.get('restResponses') as Y.Map<unknown>
    restResponsesYMap.set(restResponse.id, restResponse)

    persistenceProvider.closeDoc(scopeId)

    return true
  }

  tryAndSet(0)
}
