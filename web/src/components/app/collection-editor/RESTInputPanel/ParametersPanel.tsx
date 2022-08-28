import { useState, useEffect } from 'react'

import { QuickActionArea } from '../../utils/QuickActionArea'
import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

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
        <QuickActionArea
          onDeleteCallback={() => setParameters([])}
          isBulkEditing={isBulkEditing}
          setIsBulkEditing={setIsBulkEditing}
        />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isBulkEditing, setParameters]
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
