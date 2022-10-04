import { useContext } from 'react'

import { invariant } from 'src/lib/dnd/invariant'

import { DragDropManager } from '../../dnd-core'
import { DndContext } from '../core/index'

/**
 * A hook to retrieve the DragDropManager from Context
 */
export function useDragDropManager(): DragDropManager {
  const { dragDropManager } = useContext(DndContext)
  invariant(dragDropManager != null, 'Expected drag drop context')
  return dragDropManager as DragDropManager
}
