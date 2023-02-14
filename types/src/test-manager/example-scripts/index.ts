import type { ExecutionScript } from '../../entities'

import { globalLoadTest } from './global-load-test'
import { loadTest } from './load-test'
import { requestSingle } from './request-single'

export const BUILTIN_REST_SCRIPTS = [
  requestSingle,
  loadTest,
  globalLoadTest,
] as ExecutionScript[]

export const BULTIN_MULTI_SCRIPTS = [loadTest, globalLoadTest]
