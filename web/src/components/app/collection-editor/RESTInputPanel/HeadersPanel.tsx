import { useState, useEffect } from 'react'

import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

import { QuickActions } from './QuickActions'

type HeadersPanelProps = {
  headers: KeyValueItem[]
  setHeaders: (newHeaders: KeyValueItem[]) => void
  requestId: string
  setActionArea: (actionArea: React.ReactNode) => void
}

export const HeadersPanel = ({
  headers,
  setHeaders,
  requestId,
  setActionArea,
}: HeadersPanelProps) => {
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  useEffect(
    () =>
      setActionArea(
        <QuickActions
          onDeleteCallback={() => setHeaders([])}
          isBulkEditing={isBulkEditing}
          setIsBulkEditing={setIsBulkEditing}
        />
      ),
    [isBulkEditing, setActionArea, setHeaders]
  )

  return (
    <KeyValueEditor
      items={headers}
      setItems={setHeaders}
      isBulkEditing={isBulkEditing}
      namespace={requestId}
    />
  )
}
