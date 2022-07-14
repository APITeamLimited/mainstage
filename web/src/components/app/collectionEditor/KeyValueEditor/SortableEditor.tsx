import { useCallback, Dispatch, SetStateAction, memo } from 'react'

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

import { DraggableTableRow } from './DraggableTableRow'
import { KeyValueItem } from './KeyValueEditor'

type SortableEditorProps = {
  items: KeyValueItem[]
  setItems: (newItems: KeyValueItem[]) => void
}

export const SortableEditor = memo(
  ({ items, setItems }: SortableEditorProps) => {
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

    const withEmptyRowItems = [
      ...items,
      {
        id:
          items.reduce((largestId, item) => Math.max(largestId, item.id), 0) +
          1,
        keyString: '',
        value: '',
        enabled: true,
      },
    ]

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
                  <Box>Key</Box>
                </TableCell>
                <TableCell>
                  <Box>Value</Box>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {withEmptyRowItems.map((item, index) => (
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
                  isLast={index === withEmptyRowItems.length - 1}
                  onAddNewPair={handleCreateNewRow}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DndProvider>
    )
  }
)
