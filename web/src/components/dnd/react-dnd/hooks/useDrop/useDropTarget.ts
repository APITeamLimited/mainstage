import { useEffect, useMemo } from 'react'

import type { DropTargetMonitor } from '../../types/index'
import type { DropTargetHookSpec } from '../types'

import { DropTargetImpl } from './DropTargetImpl'

export function useDropTarget<O, R, P>(
  spec: DropTargetHookSpec<O, R, P>,
  monitor: DropTargetMonitor<O, R>
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dropTarget = useMemo(() => new DropTargetImpl(spec, monitor), [monitor])
  useEffect(() => {
    dropTarget.spec = spec
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec])
  return dropTarget
}
