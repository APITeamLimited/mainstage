import { useCallback, Dispatch, SetStateAction, memo, useState } from 'react'

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import update from 'immutability-helper'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { isReactElement } from '@redwoodjs/router/dist/util'

import { DraggableTableRow } from './DraggableTableRow'
import { KeyValueItem } from './KeyValueEditor'
import { SortableNewItemButton } from './SortableNewItemButton'

type SortableEditorProps = {
  items: KeyValueItem[]
  setItems: (newItems: KeyValueItem[]) => void
  namespace: string
  enableEnvironmentVariables?: boolean
}

export const SortableEditor = memo(
  ({
    items,
    setItems,
    namespace,
    enableEnvironmentVariables = true,
  }: SortableEditorProps) => {
    const moveCard = (dragIndex: number, hoverIndex: number) => {
      const dragItem = items[dragIndex]
      const newItems = update(items, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragItem],
        ],
      })
      setItems(newItems)
    }

    const handeKeyStringChange = (keyString: string, index: number) => {
      setItems(
        update(items, {
          [index]: {
            keyString: { $set: keyString },
          },
        })
      )
    }

    const handleValueChange = (value: string, index: number) => {
      setItems(
        update(items, {
          [index]: {
            value: { $set: value },
          },
        })
      )
    }

    const handleEnabledChange = (enabled: boolean, index: number) => {
      setItems(
        update(items, {
          [index]: {
            enabled: { $set: enabled },
          },
        })
      )
    }

    const handleDelete = (index: number) => {
      setItems(
        update(items, {
          $splice: [[index, 1]],
        })
      )
    }

    const handleCreateNewRow = () => {
      const largestOldId = items.reduce(
        (largestId, item) => Math.max(largestId, item.id),
        0
      )

      setItems(
        update(items, {
          $push: [
            {
              id: largestOldId + 1,
              keyString: '',
              value: '',
              enabled: true,
            },
          ],
        })
      )
    }

    return (
      <DndProvider backend={HTML5Backend}>
        <TableContainer>
          <Table size="small">
            <TableHead
              sx={{
                backgroundColor: 'transparent',
              }}
            >
              <TableRow>
                <TableCell />
                <TableCell />
                <TableCell>
                  <Box paddingLeft={2}>Key</Box>
                </TableCell>
                <TableCell>
                  <Box paddingLeft={2}>Value</Box>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <DraggableTableRow
                  key={index}
                  index={index}
                  id={item.id}
                  keyString={item.keyString}
                  value={item.value}
                  enabled={item.enabled}
                  onMove={moveCard}
                  onKeyStringChange={handeKeyStringChange}
                  onValueChange={handleValueChange}
                  onEnabledChange={handleEnabledChange}
                  onDelete={handleDelete}
                  namespace={namespace}
                  enableEnvironmentVariables={enableEnvironmentVariables}
                />
              ))}
            </TableBody>
          </Table>
          <SortableNewItemButton onNewKeyValuePair={handleCreateNewRow} />
        </TableContainer>
      </DndProvider>
    )
  }
)
