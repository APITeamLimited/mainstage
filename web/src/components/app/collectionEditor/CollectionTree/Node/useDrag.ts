import { DragSourceMonitor, useDrag } from 'react-dnd'

import { NodeItem } from './Node'

type UseNodeDragArgs = {
  item: NodeItem
  parentIndex: number
}

export const useNodeDrag = ({ item, parentIndex }: UseNodeDragArgs) =>
  useDrag(
    () => ({
      type: item.__typename,
      item: {
        dropItem: item,
        parentIndex,
      },
      collect: (monitor: DragSourceMonitor) => ({
        isBeingDragged: monitor.isDragging(),
        indexBeingDraged: parentIndex,
      }),
    }),
    [item, parentIndex]
  )
