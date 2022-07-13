import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { BulkEditor } from './BulkEditor'
import { SortableEditor } from './SortableEditor'

export type KeyValueItem = {
  id: number
  keyString: string
  value: string
  enabled: boolean
}

type KeyValueEditorProps = {
  items: KeyValueItem[]
  setItems: Dispatch<SetStateAction<KeyValueItem[]>>
  isBulkEditing?: boolean
}

export const KeyValueEditor = ({
  items,
  setItems,
  isBulkEditing = false,
}: KeyValueEditorProps) => {
  const [bulkContents, setBulkContents] = useState('')

  const generateBulkContents = (keyValueItems: KeyValueItem[]) =>
    keyValueItems
      .map((item) => {
        if (item.enabled) {
          return `${item.keyString}: ${item.value}`
        } else {
          return `#${item.keyString}: ${item.value}`
        }
      })
      .join('\n')

  const generateKeyValueItems = (bulkContent: string) => {
    const foundItems: KeyValueItem[] = []

    bulkContent.split('\n').forEach((line, index) => {
      const formattedLine = line.replace(': ', ':').trim()
      const [keyString, value] = formattedLine.split(':')

      if (keyString === '' || value === '') {
        return
      }

      const notEnabled = keyString.startsWith('#')

      // Remove '#' from keyString if enabled is true
      const keyStringWithoutHash = notEnabled
        ? keyString.substring(1)
        : keyString

      foundItems.push({
        id: index,
        keyString: keyStringWithoutHash?.trim(),
        value: value?.trim(),
        enabled: !notEnabled,
      } as KeyValueItem)
    })

    return foundItems
  }

  useEffect(() => {
    if (isBulkEditing) {
      setBulkContents(generateBulkContents(items))
    } else {
      setItems(generateKeyValueItems(bulkContents))
      setBulkContents('')
    }
    // Only want to setBulkContents if isBulkEditing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkEditing])

  return isBulkEditing ? (
    <BulkEditor contents={bulkContents} setContents={setBulkContents} />
  ) : (
    <SortableEditor items={items} setItems={setItems} />
  )
}
