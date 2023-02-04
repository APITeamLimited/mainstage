/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Divider, Paper } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { CollectionEditorIcon } from 'src/components/utils/Icons'
import { useSimplebarReactModule } from 'src/contexts/imports'
import { HTML5Backend } from 'src/lib/dnd/backend-html5'
import { DndProvider } from 'src/lib/dnd/react-dnd'
import { useYMap } from 'src/lib/zustand-yjs'

import { EmptyAside } from '../../utils/EmptyAside'

import { CollectionTopMenu } from './CollectionTopMenu'
import { NewItemPopover } from './NewItemPopover'
import { Node } from './Node'

type CollectionTreeProps = {
  collectionYMap: YMap<any>
  show: boolean
  showEnvironmentsCallback: () => void
}

export const CollectionTree = ({
  collectionYMap,
  show,
  showEnvironmentsCallback,
}: CollectionTreeProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  const newItemButtonRef = useRef<HTMLButtonElement | null>(null)
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false)

  const quickstartButtonRef = useRef<HTMLButtonElement | null>(null)
  const [quickstartPopoverOpen, setQuickstartPopoverOpen] = useState(false)

  const collectionHook = useYMap(collectionYMap)

  const collectionEmpty = useMemo(
    () =>
      collectionYMap.get('folders')?.size === 0 &&
      collectionYMap.get('restRequests')?.size === 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collectionHook]
  )

  return (
    <>
      {show && (
        <>
          <NewItemPopover
            anchorEl={newItemButtonRef.current}
            collectionYMap={collectionYMap}
            open={newItemPopoverOpen}
            onClose={() => setNewItemPopoverOpen(false)}
          />
          <NewItemPopover
            anchorEl={quickstartButtonRef.current}
            collectionYMap={collectionYMap}
            open={quickstartPopoverOpen}
            onClose={() => setQuickstartPopoverOpen(false)}
          />
        </>
      )}
      <Box
        sx={{
          display: show ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          maxHeight: '100%',
          backgroundColor: 'inherit',
          flex: 1,
        }}
      >
        <CollectionTopMenu
          collectionYMap={collectionYMap}
          showEnvironmentsCallback={showEnvironmentsCallback}
        />
        <Divider />
        <Button
          variant="contained"
          size="small"
          color="info"
          ref={newItemButtonRef}
          onClick={() => setNewItemPopoverOpen(true)}
          sx={{
            margin: 2,
            padding: 0,
            backgroundColor: 'primary',
            height: '24px',
          }}
        >
          <AddIcon fontSize="small" />
        </Button>
        <Box
          sx={{
            overflow: 'hidden',
            height: '100%',
            maxHeight: '100%',
          }}
        >
          <SimpleBar style={{ maxHeight: '100%' }}>
            {collectionEmpty ? (
              <EmptyAside
                primaryText="No items in this collection"
                secondaryText='Anything you add will show up here, like "Folders" and "Requests".'
                icon={CollectionEditorIcon}
              >
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setQuickstartPopoverOpen(true)}
                  sx={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  ref={quickstartButtonRef}
                >
                  Get Started
                </Button>
              </EmptyAside>
            ) : (
              <DndProvider backend={HTML5Backend}>
                <Node
                  collectionYMap={collectionYMap}
                  nodeYMap={collectionYMap}
                  parentIndex={0}
                />
              </DndProvider>
            )}
          </SimpleBar>
        </Box>
      </Box>
    </>
  )
}
