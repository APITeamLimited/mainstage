import { Box, Divider } from '@mui/material'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { LocalCollection } from 'src/contexts/reactives'

import { CollectionTopMenu } from './CollectionTopMenu'
import { Node } from './Node'

type CollectionTreeProps = {
  collection: LocalCollection
}

export const CollectionTree = ({ collection }: CollectionTreeProps) => {
  return (
    <Box>
      <CollectionTopMenu collection={collection} />
      <Divider />
      <DndProvider backend={HTML5Backend}>
        <Node item={collection} />
      </DndProvider>
    </Box>
  )
}
