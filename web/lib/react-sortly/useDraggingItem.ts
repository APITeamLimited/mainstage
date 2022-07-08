import React from 'react'

import context from './context'
import ID from './types/ID'
import useItems from './useItems'

export default function useDraggingItem() {
  const { dragMonitor } = React.useContext(context)
  const items = useItems()

  return React.useMemo(() => {
    if (!dragMonitor) {
      return null
    }

    const dragData: { id: ID } = dragMonitor.getItem()

    if (!dragData) {
      return null
    }

    return items.find(({ id }) => id === dragData.id)
  }, [dragMonitor, items])
}
