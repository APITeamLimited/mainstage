import { useState, useEffect } from 'react'

import { QuickActionArea } from '../../utils/QuickActionArea'
import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'
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
        <QuickActionArea
          onDeleteCallback={() => setHeaders([])}
          isBulkEditing={isBulkEditing}
          setIsBulkEditing={setIsBulkEditing}
        />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isBulkEditing, setHeaders]
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
