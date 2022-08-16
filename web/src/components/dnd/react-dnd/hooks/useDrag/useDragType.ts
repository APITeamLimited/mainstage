import { useMemo } from 'react'

import { invariant } from 'src/components/dnd/invariant'
import type { Identifier } from 'web/src/components/dnd/dnd-core'

import type { DragSourceHookSpec } from '../types'

export function useDragType(
  spec: DragSourceHookSpec<any, any, any>
): Identifier {
  return useMemo(() => {
    const result: Identifier = spec.type
    invariant(result != null, 'spec.type must be defined')
    return result
  }, [spec])
}
