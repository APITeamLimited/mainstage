import { ExecutionScript } from '@apiteam/types/src'

import { requestSingle } from './request-single'

export const BUILTIN_REST_SCRIPTS = [requestSingle] as ExecutionScript[]
