import { useState } from 'react'

import { Skeleton, Stack } from '@mui/material'
import type { Response, ResponseCookie } from 'k6/http'

import { KeyValueResultsTable } from 'src/components/app/utils/KeyValueResultsTable'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'

import { BodyPanel } from '../BodyPanel'
import { CookieTable } from '../CookieTable'

type FocusedResponsePanelProps = {
  storedResponse: Response | null
  mappedHeaders: {
    key: string
    value: string
  }[]
  cookies: ResponseCookie[]
  setActionArea: (actionArea: React.ReactNode) => void
  responseId: string
}

export const FocusedResponsePanel = ({
  storedResponse,
  mappedHeaders,
  cookies,
  setActionArea,
  responseId,
}: FocusedResponsePanelProps) => {
  const [activeSubtabIndex, setActiveSubtabIndex] = useState(0)

  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
      }}
    >
      <SecondaryChips
        names={['Body', 'Headers', 'Cookies']}
        value={activeSubtabIndex}
        onChange={setActiveSubtabIndex}
      />
      {activeSubtabIndex === 0 &&
        (storedResponse ? (
          <BodyPanel
            responseId={responseId}
            response={storedResponse}
            setActionArea={setActionArea}
          />
        ) : (
          <Skeleton />
        ))}
      {activeSubtabIndex === 1 &&
        (mappedHeaders ? (
          <KeyValueResultsTable
            setActionArea={setActionArea}
            values={mappedHeaders}
          />
        ) : (
          <Skeleton />
        ))}
      {activeSubtabIndex === 2 && (
        <CookieTable cookies={cookies} setActionArea={setActionArea} />
      )}
    </Stack>
  )
}
