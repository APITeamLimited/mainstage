import { ExecutionScript } from '@apiteam/types/src'

import { globalLoadTest } from './global-load-test'
import { requestSingle } from './request-single'

export const BUILTIN_REST_SCRIPTS = [
  requestSingle,
  globalLoadTest,
] as ExecutionScript[]

export const BULTIN_MULTI_SCRIPTS = [globalLoadTest]
