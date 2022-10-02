import { useMemo, useState } from 'react'

import { Typography } from '@mui/material'
import { Response } from 'k6/http'

import { KeyValueResultsTable } from 'src/components/app/utils/KeyValueResultsTable'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'

import { UnderlyingRequestCookiesPanel } from './UnderlyingRequestCookiesPanel'

type UnderlyingRequestPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  request: Response['request']
}

export const UnderlyingRequestPanel = ({
  setActionArea,
  request,
}: UnderlyingRequestPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const headers = useMemo(
    () =>
      Object.entries(request?.headers ?? []).map(([key, value]) => ({
        key,
        value: value.toString(),
      })),
    [request]
  )

  const cookies = useMemo(
    () =>
      Object.entries(request?.cookies ?? []).map(([key, value]) => ({
        key,
        value: value.toString(),
      })),
    [request]
  )

  const infoValues = useMemo(
    () => [
      { key: 'Method', value: request?.method as string },
      { key: 'URL', value: request?.url as string },
    ],
    [request]
  )

  return (
    <>
      <SecondaryChips
        names={['Headers', 'Cookies', 'Body', 'Info']}
        value={activeTabIndex}
        onChange={setActiveTabIndex}
      />
      {activeTabIndex === 0 && (
        <KeyValueResultsTable setActionArea={setActionArea} values={headers} />
      )}
      {activeTabIndex === 1 && (
        <UnderlyingRequestCookiesPanel
          setActionArea={setActionArea}
          cookies={cookies}
        />
      )}
      {activeTabIndex === 2 && <Typography>{request?.body}</Typography>}
      {activeTabIndex === 3 && (
        <KeyValueResultsTable
          setActionArea={setActionArea}
          values={infoValues}
        />
      )}
    </>
  )
}
