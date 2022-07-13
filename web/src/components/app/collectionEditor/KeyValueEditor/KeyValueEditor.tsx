import { useCallback, Dispatch, SetStateAction, useRef } from 'react'

import { Divider, Stack, Typography, useTheme } from '@mui/material'
import update from 'immutability-helper'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { DraggableListItem } from './DraggableListItem'

export type KeyValueItem = {
  id: number
  keyString: string
  value: string
  enabled: boolean
}

type KeyValueEditorProps = {
  items: KeyValueItem[]
  setItems: Dispatch<SetStateAction<KeyValueItem[]>>
}

export const KeyValueEditor = ({ items, setItems }: KeyValueEditorProps) => {
  const theme = useTheme()
  const firstKeyStringRef = useRef<HTMLInputElement | null>(null)
  const firstValueRef = useRef<HTMLInputElement | null>(null)

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
    (keyString: string, id: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          [id]: {
            keyString: { $set: keyString },
          },
        })
      )
    },
    [setItems]
  )

  const handleValueChange = useCallback(
    (value: string, id: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          [id]: {
            value: { $set: value },
          },
        })
      )
    },
    [setItems]
  )

  const handleEnabledChange = useCallback(
    (enabled: boolean, id: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          [id]: {
            enabled: { $set: enabled },
          },
        })
      )
    },
    [setItems]
  )

  const handleDelete = useCallback(
    (id: number) => {
      setItems((previousItems: KeyValueItem[]) =>
        update(previousItems, {
          $splice: [[id, 1]],
        })
      )
    },
    [setItems]
  )

  // Make sure Key and Value labels are aligned with the first input

  return (
    <DndProvider backend={HTML5Backend}>
      <Stack direction="row" paddingBottom={0.5}>
        <Typography
          color={theme.palette.text.secondary}
          marginLeft={8}
          variant="body2"
        >
          Key
        </Typography>
        <Typography
          color={theme.palette.text.secondary}
          variant="body2"
          marginLeft={16.5}
        >
          Value
        </Typography>
      </Stack>
      <Divider />
      {items.map((item, index) => (
        <>
          <DraggableListItem
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
            firstKeyStringRef={index === 0 ? firstKeyStringRef : undefined}
            firstValueRef={index === 0 ? firstValueRef : undefined}
          />
          <Divider />
        </>
      ))}
    </DndProvider>
  )
}
