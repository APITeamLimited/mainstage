/* eslint-disable jsx-a11y/no-autofocus */
import { useRef, memo } from 'react'

import DragHandleIcon from '@mui/icons-material/DragHandle'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import {
  Checkbox,
  IconButton,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material'
import type { Identifier, XYCoord } from 'dnd-core'
import { useDrag, useDrop } from 'react-dnd'

import { EnvironmentTextField } from '../../EnvironmentManager'

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
  isLast: boolean
  onAddNewPair: () => void
}

interface DragRow {
  index: number
  id: string
  type: 'DraggableType'
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
    isLast,
    onAddNewPair,
  }: DraggableTableRowProps) => {
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
      <TableRow>
        {isLast ? (
          <TableCell
            sx={{
              padding: 0,
              whiteSpace: 'nowrap',
              width: '1px',
              visibility: 'hidden',
            }}
          >
            <IconButton sx={{}}>
              <DragHandleIcon />
            </IconButton>
          </TableCell>
        ) : (
          <TableCell
            sx={{
              padding: 0,
              whiteSpace: 'nowrap',
              width: '1px',
            }}
          >
            <div ref={ref} data-handler-id={handlerId}>
              <IconButton>
                <DragHandleIcon />
              </IconButton>
            </div>
          </TableCell>
        )}
        {isLast ? (
          <TableCell
            sx={{
              padding: 0,
              whiteSpace: 'nowrap',
              width: '1px',
              visibility: 'hidden',
            }}
          >
            <Checkbox checked={true} />
          </TableCell>
        ) : (
          <TableCell
            sx={{
              padding: 0,
              whiteSpace: 'nowrap',
              width: '1px',
            }}
          >
            <Checkbox
              // defaultChecked needed for some reason to make the checkbox work
              defaultChecked={enabled}
              checked={enabled}
              onChange={(event, value) =>
                onEnabledChange && onEnabledChange(value, index)
              }
            />
          </TableCell>
        )}
        {isLast ? (
          <TableCell
            sx={{
              paddingLeft: 0,
            }}
          >
            <TextField
              size="small"
              sx={{
                input: {
                  paddingY: 0.75,
                },
                fieldSet: {
                  // Disable focus if not active
                  borderWidth: 0,
                },
                padding: 0.25,
              }}
              value=""
              placeholder="Add Key"
              onClick={onAddNewPair}
              contentEditableStyles={{
                maxWidth: '300px',
              }}
            />
          </TableCell>
        ) : (
          <TableCell
            sx={{
              paddingLeft: 0,
            }}
          >
            <TextField
              size="small"
              sx={{
                input: {
                  paddingY: 0.75,
                },
                fieldSet: {
                  // Disable focus if not active
                  borderWidth: 0,
                },
                padding: 0.25,
              }}
              placeholder="Add Key"
              value={keyString}
              onChange={(event) =>
                onKeyStringChange &&
                onKeyStringChange(event.target.value, index)
              }
              fullWidth
              contentEditableStyles={{
                maxWidth: '300px',
              }}
            />
          </TableCell>
        )}
        {isLast ? (
          <TableCell
            sx={{
              paddingLeft: 0,
            }}
          >
            <TextField
              size="small"
              sx={{
                input: {
                  paddingY: 0.75,
                },
                fieldSet: {
                  // Disable focus if not active
                  borderWidth: 0,
                },
                padding: 0.25,
              }}
              value=""
              placeholder="Add Value"
              onClick={onAddNewPair}
              contentEditableStyles={{
                maxWidth: '300px',
              }}
            />
          </TableCell>
        ) : (
          <TableCell
            sx={{
              paddingLeft: 0,
            }}
          >
            <TextField
              size="small"
              sx={{
                input: {
                  paddingY: 0.75,
                },
                fieldSet: {
                  // Disable focus if not active
                  borderWidth: 0,
                },
                padding: 0.25,
              }}
              placeholder="Add Value"
              value={value}
              onChange={(event) =>
                onValueChange && onValueChange(event.target.value, index)
              }
              contentEditableStyles={{
                maxWidth: '300px',
              }}
            />
          </TableCell>
        )}
        {isLast ? (
          <TableCell
            sx={{
              padding: 0,
              whiteSpace: 'nowrap',
              width: '1px',
              visibility: 'hidden',
            }}
            align="right"
          >
            <IconButton
              color="error"
              onClick={() => onDelete && onDelete(index)}
            >
              <HighlightOffIcon />
            </IconButton>
          </TableCell>
        ) : (
          <TableCell
            sx={{
              padding: 0,
              whiteSpace: 'nowrap',
              width: '1px',
            }}
            align="right"
          >
            <IconButton
              color="error"
              onClick={() => onDelete && onDelete(index)}
            >
              <HighlightOffIcon />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    )
  }
)
