import { useMemo, useState } from 'react'

import { RESTRequest } from '@apiteam/types/src'
import { Alert, Stack } from '@mui/material'

import { KeyValueResultsTable } from 'src/components/app/utils/KeyValueResultsTable'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'

import { FocusedRequestBodyPanel } from './FocusedRequestBodyPanel'

type FocusedRequestPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  request: RESTRequest
  finalEndpoint: string
}

export const FocusedRequestPanel = ({
  setActionArea,
  request,
  finalEndpoint,
}: FocusedRequestPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const headers = useMemo(
    () =>
      request.headers.map(({ keyString, value }) => ({
        key: keyString,
        value: value.toString(),
      })),
    [request]
  )

  const infoValues = useMemo(
    () => [
      { key: 'Method', value: request?.method as string },
      { key: 'URL', value: finalEndpoint as string },
    ],
    [finalEndpoint, request?.method]
  )

  return (
    <Stack sx={{ height: '100%', maxHeight: '100%' }} spacing={2}>
      <SecondaryChips
        names={['Body', 'Headers', 'Info']}
        value={activeTabIndex}
        onChange={setActiveTabIndex}
      />
      <Alert severity="info">
        The final request may have been modified in the execution script
      </Alert>
      {activeTabIndex === 0 && (
        <FocusedRequestBodyPanel
          body={request.body}
          setActionArea={setActionArea}
          requestId={request.id}
        />
      )}
      {activeTabIndex === 1 && (
        <KeyValueResultsTable setActionArea={setActionArea} values={headers} />
      )}
      {activeTabIndex === 2 && (
        <KeyValueResultsTable
          setActionArea={setActionArea}
          values={infoValues}
        />
      )}
    </Stack>
  )
}
