import { useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Divider } from '@mui/material'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import * as Y from 'yjs'

import { CollectionTopMenu } from './CollectionTopMenu'
import { NewItemPopover } from './NewItemPopover'
import { Node } from './Node'

type CollectionTreeProps = {
  collectionYMap: Y.Map<any>
}

export const CollectionTree = ({ collectionYMap }: CollectionTreeProps) => {
  const newItemButtonRef = useRef<HTMLButtonElement | null>(null)
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false)

  const handleNewItemButtonOpen = () => setNewItemPopoverOpen(true)
  const handleNewItemButtonClose = () => setNewItemPopoverOpen(false)

  return (
    <>
      <NewItemPopover
        anchorEl={newItemButtonRef.current}
        collectionYMap={collectionYMap}
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
        <CollectionTopMenu collectionYMap={collectionYMap} />
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
            <Node
              collectionYMap={collectionYMap}
              nodeYMap={collectionYMap}
              parentIndex={0}
            />
          </DndProvider>
        </Box>
      </Box>
    </>
  )
}
