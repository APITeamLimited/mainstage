import { memo } from 'react'

import { KeyValueItem } from '@apiteam/types'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'
import update from 'immutability-helper'

import { HTML5Backend } from 'src/components/dnd/backend-html5'
import { DndProvider } from 'src/components/dnd/react-dnd'

import { StoredFileType } from '../../utils/FileDropzone'

import { DraggableTableRow } from './DraggableTableRow'
import { SortableNewItemButton } from './SortableNewItemButton'

type SortableEditorProps = {
  items: KeyValueItem[]
  setItems: (newItems: KeyValueItem[]) => void
  namespace: string
  enableEnvironmentVariables?: boolean
  disableAdd?: boolean
  disableDelete?: boolean
  disableKeyEdit?: boolean
  disableCheckboxes?: boolean
  enableFileFields?: boolean
}

export const SortableEditor = memo(
  ({
    items,
    setItems,
    namespace,
    enableEnvironmentVariables = true,
    disableAdd,
    disableDelete,
    disableKeyEdit,
    disableCheckboxes,
    enableFileFields,
  }: SortableEditorProps) => {
    const theme = useTheme()

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

    const handleIsFileChange = (isFile: boolean, index: number) => {
      const newItem = items[index]
      newItem.isFile = isFile

      if (isFile && newItem.fileField === undefined) {
        newItem.fileField = null
      }

      if (!isFile && newItem.fileField !== undefined) {
        delete newItem.fileField
      }

      setItems(
        update(items, {
          [index]: { $set: newItem },
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

    const handleStoredFileChange = async (
      fileField: StoredFileType | null,
      index: number
    ) => {
      setItems(
        update(items, {
          [index]: {
            fileField: { $set: fileField },
          },
        })
      )
    }

    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          overflowY: 'auto',
        }}
      >
        <DndProvider backend={HTML5Backend}>
          <TableContainer
            sx={{
              width: '100%',
              overflowX: 'visible',
            }}
          >
            {items.length > 0 && (
              <Table size="small">
                <TableHead
                  sx={{
                    backgroundColor: 'transparent',
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    />
                    {!disableCheckboxes && (
                      <TableCell
                        sx={{
                          borderColor: theme.palette.divider,
                        }}
                      />
                    )}
                    {enableFileFields && (
                      <TableCell
                        sx={{
                          borderColor: theme.palette.divider,
                        }}
                      />
                    )}
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    >
                      <Box paddingLeft={2}>Key</Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    >
                      <Box paddingLeft={2}>Value</Box>
                    </TableCell>
                    {!disableDelete && (
                      <TableCell
                        sx={{
                          borderColor: theme.palette.divider,
                        }}
                      />
                    )}
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
                      isFile={item.isFile}
                      onMove={moveCard}
                      onKeyStringChange={handeKeyStringChange}
                      onValueChange={handleValueChange}
                      onEnabledChange={handleEnabledChange}
                      onDelete={handleDelete}
                      onIsFileChange={handleIsFileChange}
                      namespace={namespace}
                      enableEnvironmentVariables={enableEnvironmentVariables}
                      disableDelete={disableDelete}
                      disableKeyEdit={disableKeyEdit}
                      disableCheckboxes={disableCheckboxes}
                      enableFileFields={enableFileFields}
                      fileField={item.fileField}
                      onStoredFileChange={handleStoredFileChange}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
            {!disableAdd && (
              <SortableNewItemButton onNewKeyValuePair={handleCreateNewRow} />
            )}
          </TableContainer>
        </DndProvider>
      </Box>
    )
  }
)
