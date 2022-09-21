import { useRef, memo } from 'react'

import DragHandleIcon from '@mui/icons-material/DragHandle'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import {
  Checkbox,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { Identifier, XYCoord } from 'src/components/dnd/dnd-core'
import { useDrag, useDrop } from 'src/components/dnd/react-dnd'

import { StyledInput } from '../../StyledInput'

interface DragRow {
  index: number
  id: string
  type: 'DraggableType'
}

type DraggableTableRowProps = {
  id: number
  index: number
  keyString: string
  value: string
  enabled: boolean
  onKeyStringChange?: (keyString: string, id: number) => void
  onValueChange?: (value: string, id: number) => void
  onEnabledChange?: (enabled: boolean, id: number) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  onDelete?: (id: number) => void
  namespace: string
  enableEnvironmentVariables?: boolean
  disableDelete?: boolean
  disableKeyEdit?: boolean
  disableCheckboxes?: boolean
}

export const DraggableTableRow = memo(
  ({
    id,
    index,
    keyString,
    value,
    enabled,
    onKeyStringChange,
    onValueChange,
    onEnabledChange,
    onMove,
    onDelete,
    namespace,
    enableEnvironmentVariables = true,
    disableDelete,
    disableKeyEdit,
    disableCheckboxes,
  }: DraggableTableRowProps) => {
    const theme = useTheme()
    const ref = useRef<HTMLDivElement>(null)
    const [{ handlerId }, drop] = useDrop<
      DragRow,
      void,
      { handlerId: Identifier | null }
    >({
      accept: 'DraggableType',
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        }
      },
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
        const hoverBoundingRect = ref.current?.getBoundingClientRect()

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

    const [{ isDragging }, drag] = useDrag({
      type: 'DraggableType',
      item: () => {
        return { id, index }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    drag(drop(ref))

    return (
      <TableRow
        style={{
          zIndex: isDragging ? 1 : 0,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <TableCell
          sx={{
            padding: 0,
            whiteSpace: 'nowrap',
            width: 0,
            borderColor: theme.palette.divider,
          }}
        >
          <div ref={ref} data-handler-id={handlerId}>
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
              checked={enabled}
              onChange={(_, value) => onEnabledChange?.(value, index)}
            />
          </TableCell>
        )}
        <TableCell
          sx={{
            maxWidth: '200px',
            width: '200px',
            borderColor: theme.palette.divider,
          }}
        >
          {enableEnvironmentVariables && !disableKeyEdit ? (
            <EnvironmentTextField
              placeholder="Add Key"
              value={keyString}
              onChange={(value) => onKeyStringChange?.(value, index)}
              namespace={`${namespace}_${id}_key`}
            />
          ) : (
            <StyledInput
              value={keyString}
              onChangeValue={(value) => onKeyStringChange?.(value, index)}
              readonly={disableKeyEdit}
            />
          )}
        </TableCell>
        <TableCell
          sx={{
            maxWidth: '200px',
            width: '200px',
            borderColor: theme.palette.divider,
          }}
        >
          {enableEnvironmentVariables ? (
            <EnvironmentTextField
              placeholder="Add Value"
              value={value}
              onChange={(value) => onValueChange?.(value, index)}
              namespace={`${namespace}_${id}_value`}
            />
          ) : (
            <StyledInput
              value={value}
              onChangeValue={(value) => onValueChange?.(value, index)}
            />
          )}
        </TableCell>
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
              <IconButton color="error" onClick={() => onDelete?.(index)}>
                <HighlightOffIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        )}
      </TableRow>
    )
  }
)
