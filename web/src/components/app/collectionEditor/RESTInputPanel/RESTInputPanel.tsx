import { useState } from 'react'

import { Stack, Tab, Tabs } from '@mui/material'

import { LocalRESTRequest } from 'src/contexts/reactives'

import { BodyPanel } from './BodyPanel'
import { EndpointBox } from './EndpointBox'
import { HeadersPanel } from './HeadersPanel'
import { ParametersPanel } from './ParametersPanel'
import { SaveButton } from './SaveButton'
import { SendButton } from './SendButton'
import { AuthorisationPanel } from '../AuthorisationPanel'

type RESTInputPanelProps = {
  request: LocalRESTRequest
}

export const RESTInputPanel = ({ request }: RESTInputPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [unsavedEndpoint, setUnsavedEndpoint] = useState(request.endpoint)
  const [unsavedHeaders, setUnsavedHeaders] = useState(request.headers)
  const [unsavedParameters, setUnsavedParameters] = useState(request.parameters)
  const [unsavedBody, setUnsavedBody] = useState(request.body)
  const [unsavedRequestMethod, setUnsavedRequestMethod] = useState(
    request.method
  )
  const [unsavedAuthorisation, setUnsavedAuthorisation] = useState(request.auth)

  const handleTabChange = (event: React.SyntheticEvent<Element, Event>, newValue: number) => {
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
      <Stack direction="row" spacing={1}>
        <EndpointBox
          unsavedEndpoint={unsavedEndpoint}
          setUnsavedEndpoint={setUnsavedEndpoint}
          requestMethod={unsavedRequestMethod}
          setRequestMethod={setUnsavedRequestMethod}
        />
        <SendButton />
        <SaveButton />
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
      {activeTabIndex === 1 && (
        <BodyPanel body={unsavedBody} setBody={setUnsavedBody} />
      )}
      {activeTabIndex === 2 && (
        <HeadersPanel headers={unsavedHeaders} setHeaders={setUnsavedHeaders} />
      )}
      {
        activeTabIndex === 3 && (
          <AuthorisationPanel auth={unsavedAuthorisation} setAuth={setUnsavedAuthorisation} />
        )
      }
    </Stack>
  )
}
