import { useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Divider } from '@mui/material'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { LocalCollection } from 'src/contexts/reactives'

import { CollectionTopMenu } from './CollectionTopMenu'
import { NewItemPopover } from './NewItemPopover'
import { Node } from './Node'

type CollectionTreeProps = {
  collection: LocalCollection
}

export const CollectionTree = ({ collection }: CollectionTreeProps) => {
  const newItemButtonRef = useRef<HTMLButtonElement | null>(null)
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false)

  const handleNewItemButtonOpen = () => setNewItemPopoverOpen(true)
  const handleNewItemButtonClose = () => setNewItemPopoverOpen(false)

  return (
    <>
      <NewItemPopover
        anchorEl={newItemButtonRef.current}
        collection={collection}
        open={newItemPopoverOpen}
        onClose={handleNewItemButtonClose}
      />
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

        <Button
          variant="contained"
          size="small"
          color="info"
          ref={newItemButtonRef}
          onClick={handleNewItemButtonOpen}
          sx={{
            margin: 2,
            padding: 0,
          }}
        >
          <AddIcon />
        </Button>
        <Box
          sx={{
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <DndProvider backend={HTML5Backend}>
            <Node item={collection} parentIndex={0} />
          </DndProvider>
        </Box>
      </Box>
    </>
  )
}
