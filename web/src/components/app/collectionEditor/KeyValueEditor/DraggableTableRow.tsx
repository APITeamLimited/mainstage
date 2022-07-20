/* eslint-disable jsx-a11y/no-autofocus */
import { useRef, memo } from 'react'

import DragHandleIcon from '@mui/icons-material/DragHandle'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import {
  Button,
  Checkbox,
  IconButton,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import type { Identifier, XYCoord } from 'dnd-core'
import { useDrag, useDrop } from 'react-dnd'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'

import { StyledInput } from '../../StyledInput'

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
  namespace: string
  enableEnvironmentVariables?: boolean
}

interface DragRow {
  index: number
  id: string
  type: 'DraggableType'
}

const AddNewButton = ({
  label,
  onAddNewPair,
}: {
  label: string
  onAddNewPair: () => void
}) => {
  const theme = useTheme()
  return (
    <Button
      onClick={onAddNewPair}
      sx={{
        width: '100%',
        height: '40px',
        backgroundColor: theme.palette.alternate.dark,
        justifyContent: 'left',
        paddingLeft: 2,
        transition: 'none',
      }}
    >
      <Typography
        variant="body1"
        color={theme.palette.text.secondary}
        sx={{
          textTransform: 'none',
        }}
      >
        {label}
      </Typography>
    </Button>
  )
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
    namespace,
    enableEnvironmentVariables = true,
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
      <TableRow
        style={{
          zIndex: isDragging ? 1 : 0,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
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
              checked={enabled}
              onChange={(event, value) => onEnabledChange?.(value, index)}
            />
          </TableCell>
        )}
        {isLast ? (
          <TableCell
            sx={{
              width: '50%',
            }}
          >
            <AddNewButton label="New Key" onAddNewPair={onAddNewPair} />
          </TableCell>
        ) : (
          <TableCell
            sx={{
              width: '50%',
            }}
          >
            {enableEnvironmentVariables ? (
              <EnvironmentTextField
                placeholder="Add Key"
                value={keyString}
                onChange={(value) => onKeyStringChange?.(value, index)}
                contentEditableStyles={{}}
                namespace={`${namespace}_${id}_key`}
              />
            ) : (
              <StyledInput
                value={keyString}
                onChangeValue={(value) => onKeyStringChange?.(value, index)}
              />
            )}
          </TableCell>
        )}
        {isLast ? (
          <TableCell
            sx={{
              width: '50%',
            }}
          >
            <AddNewButton label="New Value" onAddNewPair={onAddNewPair} />
          </TableCell>
        ) : (
          <TableCell
            sx={{
              width: '50%',
            }}
          >
            {enableEnvironmentVariables ? (
              <EnvironmentTextField
                placeholder="Add Value"
                value={value}
                onChange={(value) => onValueChange?.(value, index)}
                contentEditableStyles={{}}
                namespace={`${namespace}_${id}_value`}
              />
            ) : (
              <StyledInput
                value={value}
                onChangeValue={(value) => onValueChange?.(value, index)}
              />
            )}
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
            <IconButton color="error" onClick={() => onDelete?.(index)}>
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
          >
            <IconButton color="error" onClick={() => onDelete?.(index)}>
              <HighlightOffIcon />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    )
  }
)
