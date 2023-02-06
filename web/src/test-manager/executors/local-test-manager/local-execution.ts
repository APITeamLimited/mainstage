import { ExecutionParams, WrappedExecutionParams } from '@apiteam/types/src'
import { Scope } from '@prisma/client'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'

import { BaseJob, PendingLocalJob } from '../../lib'
import { determineWrappedExecutionParams } from '../../utils'

import { LocalManagerInterface } from '.'

export const executeLocalCatchError = (
  job: BaseJob & PendingLocalJob,
  testManager: LocalManagerInterface,
  scope: Scope,
  rawBearer: string,
  activeEnvironmentYMap: YMap<any> | null
) => {
  if (testManager === null) {
    snackErrorMessageVar("Can't run local test, agent isn't connected")
    return
  }

  const wrappedExecutionParams = determineWrappedExecutionParams(job, rawBearer)
  const executionParams = createExecutionParams(wrappedExecutionParams, scope)

  testManager.submitNewJob(
    executionParams,
    wrappedExecutionParams,
    activeEnvironmentYMap
  )
}

// In cloud this is done in the test-manager
const createExecutionParams = (
  params: WrappedExecutionParams,
  scope: Scope
): ExecutionParams => ({
  // This is for local use only, will be overwritten by the backend test-manager
  id: uuid(),
  environmentContext: params.environmentContext,
  collectionContext: params.collectionContext,
  scope: {
    variant: scope.variant as 'USER' | 'TEAM',
    variantTargetId: scope.variantTargetId,
    userId: scope.userId,
  },
  verifiedDomains: [],
  createdAt: new Date().toISOString(),
  funcModeInfo: null,
  testData: params.testData,
})
