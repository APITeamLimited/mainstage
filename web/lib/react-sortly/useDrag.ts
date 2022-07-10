import { useContext, useEffect, useRef } from 'react'

import {
  useDrag as dndUseDrag,
  DragSourceHookSpec,
  ConnectDragSource,
  ConnectDragPreview,
} from 'react-dnd'

import context from './context'
import itemContext from './itemContext'
import Connectable from './types/Connectable'
import ObjectLiteral from './types/ObjectLiteral'

export function useDrag<
  DragObject extends ObjectLiteral,
  DropResult,
  CollectedProps
>(
  spec?: Partial<
    DragSourceHookSpec<
      DragObject & { type?: DragObjectWithType['type'] },
      DropResult,
      CollectedProps
    >
  >
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
  const connectedDragRef = useRef<Connectable>()

  const { setDragMonitor, setConnectedDragSource, setInitialDepth } =
    useContext(context)

  const { id, type, depth } = useContext(itemContext)

  const [collectedProps, originalConnectDragSource, connectDragPreview] =
    dndUseDrag<
      DragObjectWithType & { id: ID },
      DropResult,
      CollectedProps & { $isDragging: boolean }
    >({
      ...spec,
      collect: (monitor) => {
        const $isDragging = monitor.isDragging()
        return {
          ...((spec && spec.collect
            ? spec.collect(monitor)
            : undefined) as CollectedProps),
          $isDragging,
        }
      },
      isDragging: (monitor) => monitor.getItem().id === id,
      type,
      item: {
        type,
        ...(spec && spec.item ? spec.item : {}),
        id,
      },
      end(daggedItem, monitor) {
        setInitialDepth(undefined)
        setDragMonitor(undefined)

        if (spec && spec.end) {
          spec.end(daggedItem, monitor)
        }

        return daggedItem
      },
    })

  const connectDragSource = (
    ...args: Parameters<typeof originalConnectDragSource>
  ) => {
    const result = originalConnectDragSource(...args)
    // @ts-ignore
    connectedDragRef.current = result
    return result
  }

  const { $isDragging, ...rest } = collectedProps

  useEffect(() => {
    if ($isDragging) {
      setConnectedDragSource(connectedDragRef)
    }
  }, [$isDragging, setConnectedDragSource])

  return [rest, connectDragSource, connectDragPreview]
}
