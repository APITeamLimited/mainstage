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
  setItems: (newItems: KeyValueItem[]) => void
  isBulkEditing?: boolean
  requestId: string
}

export const KeyValueEditor = ({
  items,
  setItems,
  isBulkEditing = false,
  requestId,
}: KeyValueEditorProps) => {
  const [bulkContents, setBulkContents] = useState('')
  const [doneFirstNonBulkRender, setDoneFirstNonBulkRender] = useState(false)

  const generateBulkContents = (keyValueItems: KeyValueItem[]) => {
    const generatedLines: string[] = []

    keyValueItems.forEach((item) => {
      if (item.keyString === '' || item.value === '') {
        return
      }

      if (item.enabled) {
        generatedLines.push(`${item.keyString}: ${item.value}`)
      } else {
        generatedLines.push(`#${item.keyString}: ${item.value}`)
      }
    })

    return generatedLines.join('\n')
  }

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
      setDoneFirstNonBulkRender(false)
    } else if (!doneFirstNonBulkRender) {
      setItems(generateKeyValueItems(bulkContents))
      setBulkContents('')
      setDoneFirstNonBulkRender(true)
    }
    // Don't add bulkContents, don't want state to update when editing and not
    // TextField is potentially not formatted correctly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkEditing, items, setItems])

  return isBulkEditing ? (
    <BulkEditor contents={bulkContents} setContents={setBulkContents} />
  ) : (
    <SortableEditor items={items} setItems={setItems} requestId={requestId} />
  )
}
