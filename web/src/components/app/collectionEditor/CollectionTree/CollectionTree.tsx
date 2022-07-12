import { Box, Divider, useTheme } from '@mui/material'
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        backgroundColor: 'inherit',
      }}
    >
      <CollectionTopMenu collection={collection} />
      <Divider />
      <Box
        sx={{
          overflowY: 'auto',
        }}
      >
        <DndProvider backend={HTML5Backend}>
          <Node item={collection} parentIndex={0} />
        </DndProvider>
      </Box>
    </Box>
  )
}
