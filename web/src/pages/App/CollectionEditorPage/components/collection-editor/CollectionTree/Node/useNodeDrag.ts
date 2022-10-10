/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Map as YMap } from 'yjs'

import { useDrag } from 'src/lib/dnd/react-dnd'
import type { DragSourceMonitor } from 'src/lib/dnd/react-dnd'

type UseNodeDragArgs = {
  nodeYMap: YMap<any>
  parentIndex: number
}

export type DragDetails = {
  dropItem: YMap<any>
  parentIndex: number
}

export const useNodeDrag = ({ nodeYMap, parentIndex }: UseNodeDragArgs) => {
  //console.log('dragging node', nodeYMap)
  return useDrag(
    () => ({
      type: nodeYMap.get('__typename'),
      item: {
        dropItem: nodeYMap.get('__typename') !== 'Collection' ? nodeYMap : null,
        parentIndex,
      } as DragDetails,
      collect: (monitor: DragSourceMonitor) => ({
        isBeingDragged: monitor.isDragging(),
        indexBeingDraged: parentIndex,
      }),
    }),
    [nodeYMap, parentIndex]
  )
}
