import { useCallback, Dispatch, SetStateAction } from 'react'

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
  setItems: Dispatch<SetStateAction<KeyValueItem[]>>
}

export const SortableEditor = ({ items, setItems }: SortableEditorProps) => {
  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, previousItems[dragIndex] as KeyValueItem],
          ],
        })
      )
    },
    [setItems]
  )

  const handeKeyStringChange = useCallback(
    (keyString: string, index: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          [index]: {
            keyString: { $set: keyString },
          },
        })
      )
    },
    [setItems]
  )

  const handleValueChange = useCallback(
    (value: string, index: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          [index]: {
            value: { $set: value },
          },
        })
      )
    },
    [setItems]
  )

  const handleEnabledChange = useCallback(
    (enabled: boolean, index: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          [index]: {
            enabled: { $set: enabled },
          },
        })
      )
    },
    [setItems]
  )

  const handleDelete = useCallback(
    (index: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems.slice(0, -1), {
          $splice: [[index, 1]],
        })
      )
    },
    [setItems]
  )

  const handleCreateNewRow = () => {
    const largestOldId = items.reduce(
      (largestId, item) => Math.max(largestId, item.id),
      0
    )

    setItems((previousItems: KeyValueItem[]) =>
      update(previousItems, {
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
        items.reduce((largestId, item) => Math.max(largestId, item.id), 0) + 1,
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
