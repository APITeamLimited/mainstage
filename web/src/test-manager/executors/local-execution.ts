import { ExecutionParams, WrappedExecutionParams } from '@apiteam/types/src'
import { Scope } from '@prisma/client'
import { v4 as uuid } from 'uuid'

import { snackErrorMessageVar } from 'src/components/app/dialogs'

import { BaseJob, PendingLocalJob } from '../lib'
import { LocalManagerInterface } from '../local-test-manager'
import { determineWrappedExecutionParams } from '../utils'

export const executeLocalCatchError = (
  job: BaseJob & PendingLocalJob,
  testManager: LocalManagerInterface,
  scope: Scope,
  rawBearer: string
) => {
  if (testManager === null) {
    snackErrorMessageVar("Can't run local test, agent isn't connected")
    return
  }

  const wrappedExecutionParams = determineWrappedExecutionParams(job, rawBearer)
  const executionParams = createExecutionParams(wrappedExecutionParams, scope)

  testManager.submitNewJob(executionParams, wrappedExecutionParams)
}

// In cloud this is done in the test-manager
const createExecutionParams = (
  params: WrappedExecutionParams,
  scope: Scope
): ExecutionParams => ({
  id: uuid(),
  source: params.source,
  sourceName: params.sourceName,
  environmentContext: params.environmentContext,
  collectionContext: params.collectionContext,
  finalRequest: params.finalRequest,
  underlyingRequest: params.underlyingRequest,
  scope: {
    variant: scope.variant as 'USER' | 'TEAM',
    variantTargetId: scope.variantTargetId,
    userId: scope.userId,
  },
  verifiedDomains: [],
  createdAt: new Date().toISOString(),
  funcModeInfo: null,
})
