import { useState } from 'react'

import { Stack, Tab, Tabs } from '@mui/material'

import { LocalRESTRequest } from 'src/contexts/reactives'

import { BodyPanel } from './BodyPanel'
import { EndpointBox } from './EndpointBox'
import { HeadersPanel } from './HeadersPanel'
import { ParametersPanel } from './ParametersPanel'
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
    <Stack
      padding={2}
      spacing={2}
      sx={{
        height: 'calc(100% - 2em)',
      }}
    >
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
        <Tab label="Parameters" />
        <Tab label="Body" />
        <Tab label="Headers" />
        <Tab label="Authorisation" />
      </Tabs>
      {activeTabIndex === 0 && <ParametersPanel />}
      {activeTabIndex === 1 && <BodyPanel />}
      {activeTabIndex === 2 && <HeadersPanel />}
    </Stack>
  )
}
