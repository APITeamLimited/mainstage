/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Divider } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { useSimplebarReactModule } from 'src/contexts/imports'
import { HTML5Backend } from 'src/lib/dnd/backend-html5'
import { DndProvider } from 'src/lib/dnd/react-dnd'

import { CollectionTopMenu } from './CollectionTopMenu'
import { NewItemPopover } from './NewItemPopover'
import { Node } from './Node'

type CollectionTreeProps = {
  collectionYMap: YMap<any>
}

export const CollectionTree = ({ collectionYMap }: CollectionTreeProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

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
            backgroundColor: 'primary',
            marginBottom: 1.875,
          }}
        >
          <AddIcon fontSize="small" />
        </Button>
        <SimpleBar style={{ maxHeight: '100%', overflowX: 'hidden' }}>
          <DndProvider backend={HTML5Backend}>
            <Node
              collectionYMap={collectionYMap}
              nodeYMap={collectionYMap}
              parentIndex={0}
            />
          </DndProvider>
        </SimpleBar>
      </Box>
    </>
  )
}
