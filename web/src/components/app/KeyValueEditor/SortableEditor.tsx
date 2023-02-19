import { useCallback, useMemo, useRef } from 'react'

import {
  DefaultKV,
  FileFieldKV,
  KeyValueItem,
  KVVariantTypes,
  LocalValueKV,
} from '@apiteam/types'
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
import { v4 as uuid } from 'uuid'

import { useDnDModule, useSimplebarReactModule } from 'src/contexts/imports'

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
  disableScroll?: boolean
  variant: KeyValueItem<T>['variant']
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
  disableScroll,
  variant,
}: SortableEditorProps<T>) => {
  const { HTML5Backend, DndProvider } = useDnDModule()
  const { default: SimpleBar } = useSimplebarReactModule()

  const itemsRef = useRef(items)
  itemsRef.current = items

  const theme = useTheme()

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragItem = itemsRef.current[dragIndex]

      const newItems = update(itemsRef.current, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragItem],
        ],
      })
      setItems(newItems)
    },
    [setItems]
  )

  const handleDelete = useCallback(
    (index: number) => {
      setItems(
        update(itemsRef.current, {
          $splice: [[index, 1]],
        })
      )
    },
    [setItems]
  )

  const handleCreateNewRow = useCallback(() => {
    const largestOldId = itemsRef.current.reduce(
      (largestId, item) => Math.max(largestId, item.id),
      0
    )

    let newItem: KeyValueItem<T> | null = null

    if (variant === 'filefield') {
      const filefield: KeyValueItem<FileFieldKV> = {
        id: largestOldId + 1,
        keyString: '',
        enabled: true,
        variant: 'filefield',
        fileEnabled: false,
        value: '',
      }
      newItem = filefield as unknown as KeyValueItem<T>
    } else if (variant === 'localvalue') {
      const localValue: KeyValueItem<LocalValueKV> = {
        id: largestOldId + 1,
        keyString: '',
        enabled: true,
        variant: 'localvalue',
        value: '',
        localValue: {
          __typename: 'LocalObject',
          localId: uuid(),
          data: null,
        },
      }

      newItem = localValue as unknown as KeyValueItem<T>
    } else if (variant === 'default') {
      const defaultValue: KeyValueItem<DefaultKV> = {
        id: largestOldId + 1,
        keyString: '',
        enabled: true,
        variant: 'default',
        value: '',
      }

      newItem = defaultValue as unknown as KeyValueItem<T>
    } else {
      throw new Error(`Unknown variant ${variant}`)
    }

    setItems(
      update(itemsRef.current, {
        $push: [newItem],
      })
    )
  }, [setItems, variant])

  const handleSetItem = useCallback(
    (index: number, newItem: KeyValueItem<T>) => {
      setItems(
        update(itemsRef.current, {
          [index]: { $set: newItem },
        })
      )
    },
    [setItems]
  )

  const inner = useMemo(
    () => (
      <>
        {items.length > 0 && (
          <Table size="small" sx={{ width: '100%' }}>
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
      </>
    ),
    [
      disableAdd,
      disableCheckboxes,
      disableDelete,
      disableKeyEdit,
      enableEnvironmentVariables,
      handleCreateNewRow,
      handleDelete,
      handleSetItem,
      items,
      moveCard,
      namespace,
      theme.palette.divider,
      theme.palette.text.secondary,
      variant,
    ]
  )

  return (
    <DndProvider backend={HTML5Backend}>
      {disableScroll ? (
        inner
      ) : (
        <Box
          style={{
            maxWidth: disableScroll ? 'auto' : '100%',
            width: '100%',
            height: '100%',
            maxHeight: disableScroll ? 'auto' : '100%',
            overflow: disableScroll ? 'visible' : 'hidden',
          }}
        >
          <SimpleBar style={{ height: '100%', maxHeight: '100%' }}>
            {inner}
          </SimpleBar>
        </Box>
      )}
    </DndProvider>
  )
}
