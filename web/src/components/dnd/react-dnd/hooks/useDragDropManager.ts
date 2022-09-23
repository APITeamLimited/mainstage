import { useContext } from 'react'

import type { DragDropManager } from 'web/src/components/dnd/dnd-core'

import { invariant } from 'src/components/dnd/invariant'

import { DndContext } from '../core/index'

/**
 * A hook to retrieve the DragDropManager from Context
 */
export function useDragDropManager(): DragDropManager {
  const { dragDropManager } = useContext(DndContext)
  invariant(dragDropManager != null, 'Expected drag drop context')
  return dragDropManager as DragDropManager
}
