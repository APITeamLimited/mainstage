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
      Object.entries(request.headers).map(([key, value]) => ({
        key,
        value: value.toString(),
      })),
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
          cookies={Object.values(request.cookies).flat()}
        />
      )}
      {activeTabIndex === 2 && <Typography>{request.body}</Typography>}
      {activeTabIndex === 3 && (
        <KeyValueResultsTable
          setActionArea={setActionArea}
          values={[
            { key: 'Method', value: request.method },
            { key: 'URL', value: request.url },
          ]}
        />
      )}
    </>
  )
}
