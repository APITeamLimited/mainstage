import type { Doc as YDoc, Map as YMap } from 'yjs'

import { useDrop } from 'src/components/dnd/react-dnd'

import { DragDetails } from './useNodeDrag'

export type UseNodeDropArgs = {
  nodeYMap: YMap<any>
  handleDrop: (
    dropResult: DragDetails,
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
        return {
          hovered: monitor.canDrop() && monitor.isOver({ shallow: true }), //&&
          //monitor.getItem().dropItem.get('id') !== nodeYMap.get('id'),
          nodeYMapBeingHovered: monitor.getItem(),
        }
      },
    }),
    [nodeYMap, handleDrop]
  )
