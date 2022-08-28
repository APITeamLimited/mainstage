import { useState, useEffect } from 'react'

import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

import { QuickActions } from './QuickActions'

type ParametersPanelProps = {
  parameters: KeyValueItem[]
  setParameters: (newParameters: KeyValueItem[]) => void
  requestId: string
  setActionArea: (actionArea: React.ReactNode) => void
}

export const ParametersPanel = ({
  parameters,
  setParameters,
  requestId,
  setActionArea,
}: ParametersPanelProps) => {
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  useEffect(
    () =>
      setActionArea(
        <QuickActions
          onDeleteCallback={() => setParameters([])}
          isBulkEditing={isBulkEditing}
          setIsBulkEditing={setIsBulkEditing}
        />
      ),
    [isBulkEditing, setActionArea, setParameters]
  )

  return (
    <KeyValueEditor
      items={parameters}
      setItems={setParameters}
      isBulkEditing={isBulkEditing}
      namespace={requestId}
    />
  )
}
