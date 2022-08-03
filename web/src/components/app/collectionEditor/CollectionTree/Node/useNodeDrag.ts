import { DragSourceMonitor, useDrag } from 'react-dnd'

type UseNodeDragArgs = {
  nodeYMap: Y.Map<any>
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
      },
      collect: (monitor: DragSourceMonitor) => ({
        isBeingDragged: monitor.isDragging(),
        indexBeingDraged: parentIndex,
      }),
    }),
    [nodeYMap, parentIndex]
  )
}
