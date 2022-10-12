import { useRef } from 'react'

import { FileFieldKV, KeyValueItem, KVVariantTypes } from '@apiteam/types/src'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import {
  Checkbox,
  IconButton,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  useTheme,
  Box,
} from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { useDnDModule } from 'src/contexts/imports'
import type { XYCoord } from 'src/lib/dnd/dnd-core'

import { StyledInput } from '../StyledInput'
import { StoredDropzone } from '../utils/FileDropzone'

interface DragRow {
  index: number
  id: number
  type: 'DraggableType'
}

type DraggableTableRowProps<T extends KVVariantTypes> = {
  index: number
  item: KeyValueItem<T>
  namespace: string
  enableEnvironmentVariables?: boolean
  disableDelete?: boolean
  disableKeyEdit?: boolean
  disableCheckboxes?: boolean
  variant: T['variant']
  onMove: (dragIndex: number, hoverIndex: number) => void
  setItem: (newItem: KeyValueItem<T>) => void
  onDelete: () => void
}

export const DraggableTableRow = <T extends KVVariantTypes>({
  index,
  item,
  namespace,
  enableEnvironmentVariables = true,
  disableDelete,
  disableKeyEdit,
  disableCheckboxes,
  variant,
  setItem,
  onMove,
  onDelete,
}: DraggableTableRowProps<T>) => {
  const { useDrag, useDrop } = useDnDModule()

  const theme = useTheme()
  const ref = useRef(null)

  const [, drop] = useDrop<DragRow>({
    accept: 'DraggableType',
    hover(item: DragRow, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = (
        ref.current as HTMLDivElement
      ).getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move wheborder the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isBeingDragged }, drag] = useDrag<
    DragRow,
    unknown,
    {
      isBeingDragged: boolean
    }
  >({
    type: 'DraggableType',
    item: {
      index,
      id: item.id,
      type: 'DraggableType',
    },
    collect: (monitor) => ({
      isBeingDragged: monitor.isDragging(),
    }),
  })

  const handleIsFileChange = (fileEnabled: boolean) => {
    if (variant !== 'filefield') {
      throw new Error('Cannot change fileEnabled on non-filefield variant')
    }

    let newItem: KeyValueItem<FileFieldKV> | null = null

    if (fileEnabled) {
      newItem = {
        id: item.id,
        keyString: item.keyString,
        enabled: item.enabled,
        variant: 'filefield',
        fileEnabled: true,
        fileField: null,
      }
    } else {
      newItem = {
        id: item.id,
        keyString: item.keyString,
        enabled: item.enabled,
        variant: 'filefield',
        fileEnabled: false,
        value: '',
      }
    }

    // Already asserted variant is filefield so cast
    setItem(newItem as unknown as KeyValueItem<T>)
  }

  drag(drop(ref))

  return (
    <TableRow
      style={{
        opacity: isBeingDragged ? 0 : 1,
      }}
      ref={ref}
    >
      <TableCell
        sx={{
          padding: 0,
          whiteSpace: 'nowrap',
          width: 0,
          borderColor: theme.palette.divider,
        }}
      >
        <div
          style={{
            userSelect: 'auto',
          }}
        >
          <IconButton>
            <DragHandleIcon />
          </IconButton>
        </div>
      </TableCell>
      {!disableCheckboxes && (
        <TableCell
          sx={{
            padding: 0,
            whiteSpace: 'nowrap',
            width: 0,
            borderColor: theme.palette.divider,
          }}
        >
          <Checkbox
            checked={item.enabled}
            onChange={(_, value) => setItem({ ...item, enabled: value })}
          />
        </TableCell>
      )}
      {item.variant === 'filefield' && (
        <TableCell
          sx={{
            padding: 0,
            whiteSpace: 'nowrap',
            width: 0,
            borderColor: theme.palette.divider,
          }}
        >
          <TextField
            value={item.fileEnabled ? 'File' : 'Text'}
            select
            size="small"
            onChange={() => handleIsFileChange(!item.fileEnabled)}
            sx={{
              maxWidth: 80,
              width: 80,
              // Disable select padding
              '& .MuiSelect-select': {
                padding: '4px',
                position: 'relative',
                right: '-4px',
              },
            }}
          >
            <MenuItem value="Text">Text</MenuItem>
            <MenuItem value="File">File</MenuItem>
          </TextField>
        </TableCell>
      )}
      <TableCell
        sx={{
          maxWidth: '200px',
          minWidth: '200px',
          borderColor: theme.palette.divider,
        }}
      >
        {enableEnvironmentVariables && !disableKeyEdit ? (
          <EnvironmentTextField
            placeholder="Add Key"
            value={item.keyString}
            onChange={(value) => setItem({ ...item, keyString: value })}
            namespace={`${namespace}_${item.id}_key`}
          />
        ) : (
          <StyledInput
            value={item.keyString}
            onChangeValue={(value) => setItem({ ...item, keyString: value })}
            readonly={disableKeyEdit}
          />
        )}
      </TableCell>
      <TableCell
        sx={{
          maxWidth: '200px',
          minWidth: '200px',
          borderColor: theme.palette.divider,
        }}
      >
        {item.variant === 'filefield' && item.fileEnabled ? (
          <Box
            sx={{
              height: '2rem',
            }}
          >
            <StoredDropzone
              file={item.fileField}
              setFile={(file) => setItem({ ...item, fileField: file })}
              onDelete={() => setItem({ ...item, fileField: null })}
              primaryText="Drag or click to upload"
              isSmall
            />
          </Box>
        ) : enableEnvironmentVariables ? (
          <EnvironmentTextField
            placeholder="Add Value"
            value={item.value}
            onChange={(value) => setItem({ ...item, value })}
            namespace={`${namespace}_${item.id}_value`}
          />
        ) : (
          <StyledInput
            value={item.value}
            onChangeValue={(value) => setItem({ ...item, value })}
          />
        )}
      </TableCell>
      {variant === 'localvalue' && item.variant === 'localvalue' && (
        <TableCell
          sx={{
            maxWidth: '200px',
            minWidth: '200px',
            borderColor: theme.palette.divider,
          }}
        >
          {enableEnvironmentVariables ? (
            <EnvironmentTextField
              placeholder="Add Local Value"
              value={item.localValue}
              onChange={(localValue) => setItem({ ...item, localValue })}
              namespace={`${namespace}_${item.id}_key`}
            />
          ) : (
            <StyledInput
              value={item.localValue}
              onChangeValue={(localValue) => setItem({ ...item, localValue })}
              readonly={disableKeyEdit}
            />
          )}
        </TableCell>
      )}
      {!disableDelete && (
        <TableCell
          sx={{
            padding: 0,
            whiteSpace: 'nowrap',
            width: 0,
            borderColor: theme.palette.divider,
          }}
        >
          <Tooltip title="Delete">
            <IconButton color="error" onClick={onDelete}>
              <HighlightOffIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  )
}
