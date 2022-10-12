import { useRef } from 'react'

import { KeyValueItem, KVVariantTypes } from '@apiteam/types/src'
import HelpIcon from '@mui/icons-material/Help'
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material'
import update from 'immutability-helper'

import { useDnDModule } from 'src/contexts/imports'

import { DraggableTableRow } from './DraggableTableRow'
import { SortableNewItemButton } from './SortableNewItemButton'

type SortableEditorProps<T extends KVVariantTypes> = {
  items: KeyValueItem<T>[]
  setItems: (newItems: KeyValueItem<T>[]) => void
  namespace: string
  enableEnvironmentVariables?: boolean
  disableAdd?: boolean
  disableDelete?: boolean
  disableKeyEdit?: boolean
  disableCheckboxes?: boolean
  variant: T['variant']
}

export const SortableEditor = <T extends KVVariantTypes>({
  items,
  setItems,
  namespace,
  enableEnvironmentVariables = true,
  disableAdd,
  disableDelete,
  disableKeyEdit,
  disableCheckboxes,
  variant,
}: SortableEditorProps<T>) => {
  const { HTML5Backend, DndProvider } = useDnDModule()

  const itemsRef = useRef(items)
  itemsRef.current = items

  const theme = useTheme()

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const dragItem = itemsRef.current[dragIndex]

    const newItems = update(itemsRef.current, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragItem],
      ],
    })
    setItems(newItems)
  }

  const handleDelete = (index: number) => {
    setItems(
      update(itemsRef.current, {
        $splice: [[index, 1]],
      })
    )
  }

  const handleCreateNewRow = () => {
    const largestOldId = itemsRef.current.reduce(
      (largestId, item) => Math.max(largestId, item.id),
      0
    )

    let newItem: KeyValueItem<T> | null = null

    if (variant === 'filefield') {
      newItem = {
        id: largestOldId + 1,
        keyString: '',
        enabled: true,
        variant: 'filefield',
        fileEnabled: false,
        value: '',
      }
    } else if (variant === 'localvalue') {
      newItem = {
        id: largestOldId + 1,
        keyString: '',
        enabled: true,
        variant: 'localvalue',
        value: '',
        localValue: '',
      }
    } else {
      newItem = {
        id: largestOldId + 1,
        keyString: '',
        enabled: true,
        variant: 'default',
        value: '',
      }
    }

    setItems(
      update(itemsRef.current, {
        $push: [newItem],
      })
    )
  }

  const handleSetItem = (index: number, newItem: KeyValueItem<T>) => {
    setItems(
      update(itemsRef.current, {
        [index]: { $set: newItem },
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
                  {variant === 'filefield' && (
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
                  {variant === 'localvalue' && (
                    <TableCell
                      sx={{
                        borderColor: theme.palette.divider,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                          maxHeight: '22.72px',
                        }}
                        spacing={1}
                      >
                        <Box paddingLeft={2}>Local Value</Box>
                        <Tooltip title="Local variable value that is not synced with team members">
                          <span
                            style={{
                              maxHeight: '22.72px',
                              overflow: 'visible',
                            }}
                          >
                            <HelpIcon
                              sx={{
                                fontSize: '0.9rem',
                                color: theme.palette.text.secondary,
                              }}
                            />
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  )}
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
                    key={item.id}
                    index={index}
                    onMove={moveCard}
                    onDelete={() => handleDelete(index)}
                    namespace={namespace}
                    enableEnvironmentVariables={enableEnvironmentVariables}
                    disableDelete={disableDelete}
                    disableKeyEdit={disableKeyEdit}
                    disableCheckboxes={disableCheckboxes}
                    variant={variant}
                    setItem={(newItem) => handleSetItem(index, newItem)}
                    item={item}
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
