import { useDrop } from 'react-dnd'

import { LocalFolder, LocalRESTRequest } from 'src/contexts/reactives'

import { NodeItem, NodeProps } from './Node'

type UseNodeDropArgs = {
  item: NodeItem
  handleDrop: (
    dropResult: {
      parentIndex: number
      dropItem: LocalFolder | LocalRESTRequest
    },
    clientOffset: {
      x: number
      y: number
    } | null
  ) => void
}

export const useNodeDrop = ({ item, handleDrop }: UseNodeDropArgs) =>
  useDrop(() => ({
    accept: ['LocalFolder', 'LocalRESTRequest'],
    drop: (item, monitor) => {
      handleDrop(monitor.getItem(), monitor.getClientOffset())
    },
    collect: (monitor) => ({
      hovered:
        monitor.canDrop() &&
        monitor.isOver({ shallow: true }) &&
        monitor.getItem().dropItem.id !== item.id,
      itemBeingHovered: monitor.getItem(),
    }),
  }))
