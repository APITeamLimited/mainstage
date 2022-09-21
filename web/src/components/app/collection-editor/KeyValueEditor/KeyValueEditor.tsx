import { useEffect, useRef, useState } from 'react'

import { KeyValueItem } from '@apiteam/types'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Tooltip } from '@mui/material'

import { QuickActionArea } from '../../utils/QuickActionArea'

import { BulkEditor } from './BulkEditor'
import { SortableEditor } from './SortableEditor'

type KeyValueEditorProps = {
  items: KeyValueItem[]
  setItems: (newItems: KeyValueItem[]) => void
  namespace: string
  enableEnvironmentVariables?: boolean
  setActionArea?: (actionArea: React.ReactNode) => void
  disableAdd?: boolean
  disableDelete?: boolean
  disableKeyEdit?: boolean
  disableCheckboxes?: boolean
  disableBulkEdit?: boolean
}

export const KeyValueEditor = ({
  items,
  setItems,
  namespace,
  enableEnvironmentVariables,
  setActionArea,
  disableAdd,
  disableDelete,
  disableKeyEdit,
  disableCheckboxes,
  disableBulkEdit,
}: KeyValueEditorProps) => {
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const [bulkContents, setBulkContents] = useState('')

  const itemsRef = useRef<KeyValueItem[]>(items)
  itemsRef.current = items

  useEffect(() => {
    if (!setActionArea) {
      return
    }

    if (!itemsRef.current) {
      setActionArea(<></>)
      return
    }

    const customActions = []

    const enableCopy = itemsRef.current.length > 0
    if (enableCopy) {
      customActions.push(
        <Tooltip title="Copy All" key="Copy All">
          <Box>
            <IconButton
              onClick={() =>
                isBulkEditing
                  ? navigator.clipboard.writeText(bulkContents)
                  : navigator.clipboard.writeText(
                      `Name\tValue\n${itemsRef.current
                        .map(({ keyString, value }) => `${keyString}\t${value}`)
                        .join('\n')}`
                    )
              }
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </Tooltip>
      )
    }

    const enableDeleteButton =
      (itemsRef.current.length > 0 || bulkContents !== '') && !disableDelete

    setActionArea(
      <QuickActionArea
        onDeleteCallback={
          enableDeleteButton
            ? () => {
                setItems([])
                setBulkContents('')
                console.log('delete')
              }
            : undefined
        }
        isBulkEditing={!disableBulkEdit ? isBulkEditing : false}
        setIsBulkEditing={!disableBulkEdit ? setIsBulkEditing : undefined}
        customActions={customActions}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkEditing, items, bulkContents])

  const generateBulkContents = (keyValueItems: KeyValueItem[]) => {
    const generatedLines: string[] = []

    keyValueItems.forEach((item) => {
      if (item.keyString === '') {
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

      if (keyString === '') {
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

  // Handle bulk editor toggle
  useEffect(() => {
    if (isBulkEditing) {
      setBulkContents(generateBulkContents(items))
    } else if (bulkContents !== '') {
      setItems(generateKeyValueItems(bulkContents))
      setBulkContents('')
    }
    // Don't add bulkContents, don't want state to update when editing and not
    // TextField is potentially not formatted correctly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkEditing, setItems])

  return isBulkEditing ? (
    <BulkEditor
      contents={bulkContents}
      setContents={setBulkContents}
      monacoNamespace={namespace}
    />
  ) : (
    <SortableEditor
      items={items}
      setItems={setItems}
      namespace={namespace}
      enableEnvironmentVariables={enableEnvironmentVariables}
      // Not re-rendering when supposed to so use key
      key={bulkContents}
      disableAdd={disableAdd}
      disableDelete={disableDelete}
      disableKeyEdit={disableKeyEdit}
      disableCheckboxes={disableCheckboxes}
    />
  )
}
