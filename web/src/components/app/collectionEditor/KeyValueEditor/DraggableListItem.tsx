import { useRef } from 'react'

import {
  Box,
  Checkbox,
  Input,
  InputBase,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import type { Identifier, XYCoord } from 'dnd-core'
import { useDrag, useDrop } from 'react-dnd'

type DraggableListItemProps = {
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
  firstKeyStringRef?: React.MutableRefObject<HTMLInputElement | null>
  firstValueRef?: React.MutableRefObject<HTMLInputElement | null>
}

interface DragItem {
  index: number
  id: string
  type: 'DraggableType'
}

export const DraggableListItem = ({
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
  firstKeyStringRef,
  firstValueRef,
}: DraggableListItemProps) => {
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'DraggableType',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
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
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1

  drag(drop(ref))

  return (
    <div ref={ref} data-handler-id={handlerId} style={{ opacity }}>
      <Stack direction="row" alignItems="center">
        <Box>s</Box>
        <Checkbox />
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
          onChange={(event) =>
            onKeyStringChange && onKeyStringChange(event.target.value, id)
          }
          ref={firstKeyStringRef}
          fullWidth
        ></TextField>
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
          onChange={(event) =>
            onValueChange && onValueChange(event.target.value, id)
          }
          ref={firstValueRef}
          fullWidth
        ></TextField>
      </Stack>
    </div>
  )
}
