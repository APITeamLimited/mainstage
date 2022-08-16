import { useDrop } from 'react-dnd'

import * as Y from 'yjs'

type UseNodeDropArgs = {
  nodeYMap: Y.Map<any>
  handleDrop: (
    dropResult: {
      parentIndex: number
      dropItem: Y.Map<any>
    },
    clientOffset: {
      x: number
      y: number
    } | null
  ) => void
}

export const useNodeDrop = ({ nodeYMap, handleDrop }: UseNodeDropArgs) =>
  useDrop(
    () => ({
      accept: ['Folder', 'RESTRequest'],
      drop: (nodeYMap, monitor) => {
        handleDrop(monitor.getItem(), monitor.getClientOffset())
      },
      collect: (monitor) => {
        //console.log('collecting', monitor.getItem())
        return {
          hovered:
            monitor.canDrop() &&
            monitor.isOver({ shallow: true }) &&
            //monitor.getItem().dropItem.get('id') !== item.get('id')
            monitor.getItem().dropItem.get('id') !== nodeYMap.get('id'),
          nodeYMapBeingHovered: monitor.getItem(),
        }
      },
    }),
    [nodeYMap, handleDrop]
  )
