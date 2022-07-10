import React from 'react'

import ID from './types/ID'

type ItemContext = {
  index: number
  id: ID
  type: string | symbol
  depth: number
  onHoverBegin: (id: ID, ref: React.RefObject<Connectable>) => void
  onHoverEnd: (id: ID) => void
}

// @ts-ignore
const context = React.createContext<ItemContext>({})

export default context
