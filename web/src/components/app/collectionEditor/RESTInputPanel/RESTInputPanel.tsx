import { useState } from 'react'

import { Stack, Tab, Tabs } from '@mui/material'

import { LocalRESTRequest } from 'src/contexts/reactives'

import { EndpointBox } from './EndpointBox'
import { HeadersPanel } from './HeadersPanel'
import { SendButton } from './SendButton'

type RESTInputPanelProps = {
  request: LocalRESTRequest
}

export const RESTInputPanel = ({ request }: RESTInputPanelProps) => {
  const [unsavedEndpoint, setUnsavedEndpoint] = useState(request.endpoint)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTabIndex(newValue)
  }

  return (
    <Stack padding={2} spacing={2}>
      <Stack direction="row" spacing={2}>
        <EndpointBox
          unsavedEndpoint={unsavedEndpoint}
          setUnsavedEndpoint={setUnsavedEndpoint}
        />
        <SendButton />
      </Stack>
      <Tabs
        value={activeTabIndex}
        onChange={handleTabChange}
        variant="scrollable"
      >
        <Tab label="Query" />
        <Tab label="Body" />
        <Tab label="Headers" />
        <Tab label="Authorisation" />
      </Tabs>
      {activeTabIndex === 2 && <HeadersPanel />}
    </Stack>
  )
}
