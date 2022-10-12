import { useEffect, useRef, useState } from 'react'

import { DefaultKV, KeyValueItem, KVVariantTypes } from '@apiteam/types/src'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Tooltip } from '@mui/material'

import { QuickActionArea } from '../utils/QuickActionArea'

import { BulkEditor } from './BulkEditor'
import { SortableEditor } from './SortableEditor'

type KeyValueEditorProps<T extends KVVariantTypes> = {
  items: KeyValueItem<T>[]
  setItems: (newItems: KeyValueItem<T>[]) => void
  namespace: string
  enableEnvironmentVariables?: boolean
  setActionArea?: (actionArea: React.ReactNode) => void
  disableAdd?: boolean
  disableDelete?: boolean
  disableKeyEdit?: boolean
  disableCheckboxes?: boolean
  disableBulkEdit?: boolean
  variant: KeyValueItem<T>['variant']
}

export const KeyValueEditor = <T extends KVVariantTypes>({
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
  variant,
}: KeyValueEditorProps<T>) => {
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const [bulkContents, setBulkContents] = useState('')

  useEffect(() => {
    if (variant === 'localvalue' && !disableBulkEdit) {
      throw new Error(
        'Bulk editing is not supported for localvalue variant key values'
      )
    } else if (variant === 'filefield' && !disableBulkEdit) {
      throw new Error(
        'Bulk editing is not supported for filefield variant key values'
      )
    }
  }, [variant, disableBulkEdit])

  const itemsRef = useRef<KeyValueItem<T>[]>(items)
  itemsRef.current = items

  const generateClipboardContents = () => {
    let clipboardText = ''

    if (variant === 'filefield') {
      clipboardText = `Name\tValue\n${itemsRef.current
        .map((item) => {
          if (item.variant !== 'filefield') {
            return ''
          }

          if (item.fileEnabled) {
            return `${item.keyString}\t${item.fileField?.filename || ''}`
          } else {
            return `${item.keyString}\t${item.value}`
          }
        })
        .join('\n')}`
    } else if (variant === 'localvalue') {
      clipboardText = `Name\tValue\tLocal Value\n${itemsRef.current
        .map((item) => {
          if (item.variant !== 'localvalue') {
            return ''
          }

          return `${item.keyString}\t${item.value}\t${item.localValue}`
        })
        .join('\n')}`
    } else if (variant === 'default') {
      clipboardText = `Name\tValue\n${itemsRef.current
        .map((item) => {
          if (item.variant !== 'default') {
            return ''
          }

          return `${item.keyString}\t${item.value}`
        })
        .join('\n')}`
    }

    return clipboardText
  }

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
                  : navigator.clipboard.writeText(generateClipboardContents())
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

  const generateBulkContents = () => {
    if (variant === 'filefield' || variant === 'localvalue') {
      throw new Error(
        'Bulk editing is not supported for filefield or localvalue variant key values'
      )
    }

    const generatedLines: string[] = []

    ;(items as unknown as KeyValueItem<DefaultKV>[]).forEach((item) => {
      if (item.keyString === '') {
        return
      }

      generatedLines.push(
        `${item.enabled ? '' : '#'}${item.keyString}:${item.value}`
      )
    })

    return generatedLines.join('\n')
  }

  const generateKeyValueItems = (bulkContent: string) => {
    if (variant === 'filefield' || variant === 'localvalue') {
      throw new Error(
        'Bulk editing is not supported for filefield or localvalue variant key values'
      )
    }

    const foundItems: KeyValueItem<DefaultKV>[] = []

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

      const newItem: KeyValueItem<DefaultKV> = {
        id: index,
        variant: 'default',
        keyString: keyStringWithoutHash?.trim(),
        value: value?.trim(),
        enabled: !notEnabled,
      }

      foundItems.push(newItem)
    })

    // Return sorted by id
    // Will throw error if wrong variant so cast as T
    return foundItems
      .sort((a, b) => a.id - b.id)
      .map((item, index) => ({
        ...item,
        id: index,
      })) as unknown as KeyValueItem<T>[]
  }

  // Handle bulk editor toggle
  useEffect(() => {
    if (isBulkEditing) {
      setBulkContents(generateBulkContents())
    } else if (bulkContents !== '') {
      setItems(generateKeyValueItems(bulkContents))
      setBulkContents('')
    }
    // Don't add bulkContents, don't want state to update when editing and not
    // TextField is potentially not formatted correctly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkEditing])

  return isBulkEditing ? (
    <BulkEditor
      contents={bulkContents}
      setContents={setBulkContents}
      monacoNamespace={namespace}
    />
  ) : (
    <SortableEditor<T>
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
      variant={variant}
    />
  )
}
