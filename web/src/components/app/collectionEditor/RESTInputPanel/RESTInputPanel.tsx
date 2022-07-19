import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Stack, Tab, Tabs } from '@mui/material'

import {
  generateLocalRESTRequest,
  LocalRESTRequest,
  localRESTRequestsVar,
  updateFilterLocalRESTRequestArray,
} from 'src/contexts/reactives'

import { AuthorisationPanel } from './AuthorisationPanel'
import { BodyPanel } from './BodyPanel'
import { EndpointBox } from './EndpointBox'
import { HeadersPanel } from './HeadersPanel'
import { ParametersPanel } from './ParametersPanel'
import { SaveAsDialog } from './SaveAsDialog'
import { SaveButton } from './SaveButton'
import { SendButton } from './SendButton'

type RESTInputPanelProps = {
  request: LocalRESTRequest
}

export const RESTInputPanel = ({ request }: RESTInputPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [unsavedEndpoint, setUnsavedEndpoint] = useState(request.endpoint)
  const [unsavedHeaders, setUnsavedHeaders] = useState(request.headers)
  const [unsavedParameters, setUnsavedParameters] = useState(request.params)
  const [unsavedBody, setUnsavedBody] = useState(request.body)
  const [unsavedRequestMethod, setUnsavedRequestMethod] = useState(
    request.method
  )
  const [unsavedAuthorisation, setUnsavedAuthorisation] = useState(request.auth)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)

  // If request changes, update unsaved request
  useEffect(() => {
    setUnsavedEndpoint(request.endpoint)
    setUnsavedHeaders(request.headers)
    setUnsavedParameters(request.params)
    setUnsavedBody(request.body)
    setUnsavedRequestMethod(request.method)
    setUnsavedAuthorisation(request.auth)
  }, [request])

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    setNeedSave(
      unsavedEndpoint !== request.endpoint ||
        unsavedHeaders !== request.headers ||
        unsavedParameters !== request.params ||
        unsavedBody !== request.body ||
        unsavedRequestMethod !== request.method ||
        unsavedAuthorisation !== request.auth
    )
  }, [
    unsavedEndpoint,
    unsavedHeaders,
    unsavedParameters,
    unsavedBody,
    unsavedRequestMethod,
    unsavedAuthorisation,
    request.endpoint,
    request.headers,
    request.params,
    request.body,
    request.method,
    request.auth,
  ])

  const handleTabChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    setActiveTabIndex(newValue)
  }

  const handleSave = () => {
    const newRequest: LocalRESTRequest = {
      ...request,
      endpoint: unsavedEndpoint,
      headers: unsavedHeaders,
      params: unsavedParameters,
      body: unsavedBody,
      method: unsavedRequestMethod,
      auth: unsavedAuthorisation,
    }
    localRESTRequestsVar(
      updateFilterLocalRESTRequestArray(localRESTRequests, newRequest)
    )
    setNeedSave(false)
  }

  const handleSaveAs = (newName: string) => {
    const newRequest: LocalRESTRequest = {
      ...generateLocalRESTRequest({
        parentId: request.parentId,
        __parentTypename: request.__parentTypename,
        orderingIndex: request.orderingIndex,
        name: newName,
      }),
      endpoint: unsavedEndpoint,
      headers: unsavedHeaders,
      params: unsavedParameters,
      body: unsavedBody,
      method: unsavedRequestMethod,
      auth: unsavedAuthorisation,
    }
    localRESTRequestsVar(
      updateFilterLocalRESTRequestArray(localRESTRequests, newRequest)
    )
  }

  return (
    <>
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
            requestId={request.id}
          />
          <SendButton />
          <SaveButton
            needSave={needSave}
            onSave={handleSave}
            onSaveAs={() => setShowSaveAsDialog(true)}
          />
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
        {activeTabIndex === 0 && (
          <ParametersPanel
            parameters={unsavedParameters}
            setParameters={setUnsavedParameters}
            requestId={request.id}
          />
        )}
        {activeTabIndex === 1 && (
          <BodyPanel body={unsavedBody} setBody={setUnsavedBody} />
        )}
        {activeTabIndex === 2 && (
          <HeadersPanel
            headers={unsavedHeaders}
            setHeaders={setUnsavedHeaders}
            requestId={request.id}
          />
        )}
        {activeTabIndex === 3 && (
          <AuthorisationPanel
            auth={unsavedAuthorisation}
            setAuth={setUnsavedAuthorisation}
            requestId={request.id}
          />
        )}
      </Stack>
      <SaveAsDialog
        open={showSaveAsDialog}
        onClose={() => setShowSaveAsDialog(false)}
        onSave={handleSaveAs}
      />
    </>
  )
}
