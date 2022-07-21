import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Stack } from '@mui/material'

import {
  addToQueue,
  generateLocalRESTRequest,
  LocalRESTRequest,
  localRESTRequestsVar,
  restRequestQueueVar,
  updateFilterLocalRESTRequestArray,
} from 'src/contexts/reactives'

import { CustomTabs } from '../../CustomTabs'

import { AuthPanel } from './AuthPanel'
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
  const queue = useReactiveVar(restRequestQueueVar)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [unsavedEndpoint, setUnsavedEndpoint] = useState(request.endpoint)
  const [unsavedHeaders, setUnsavedHeaders] = useState(request.headers)
  const [unsavedParameters, setUnsavedParameters] = useState(request.params)
  const [unsavedBody, setUnsavedBody] = useState(request.body)
  const [unsavedRequestMethod, setUnsavedRequestMethod] = useState(
    request.method
  )
  const [unsavedAuth, setUnsavedAuth] = useState(request.auth)
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
    setUnsavedAuth(request.auth)
  }, [request])

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    setNeedSave(
      unsavedEndpoint !== request.endpoint ||
        unsavedHeaders !== request.headers ||
        unsavedParameters !== request.params ||
        unsavedBody !== request.body ||
        unsavedRequestMethod !== request.method ||
        unsavedAuth !== request.auth
    )
  }, [
    unsavedEndpoint,
    unsavedHeaders,
    unsavedParameters,
    unsavedBody,
    unsavedRequestMethod,
    unsavedAuth,
    request,
  ])

  const handleSave = () => {
    const newRequest: LocalRESTRequest = {
      ...request,
      endpoint: unsavedEndpoint,
      headers: unsavedHeaders,
      params: unsavedParameters,
      body: unsavedBody,
      method: unsavedRequestMethod,
      auth: unsavedAuth,
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
      auth: unsavedAuth,
    }
    localRESTRequestsVar(
      updateFilterLocalRESTRequestArray(localRESTRequests, newRequest)
    )
  }

  const handleNormalSend = () => {
    const newRequest: LocalRESTRequest = {
      ...request,
      endpoint: unsavedEndpoint,
      headers: unsavedHeaders,
      params: unsavedParameters,
      body: unsavedBody,
      method: unsavedRequestMethod,
      auth: unsavedAuth,
    }

    restRequestQueueVar(addToQueue({ queue, request: newRequest }))
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
            setUnsavedEndpoint={(e) => setUnsavedEndpoint(e)}
            requestMethod={unsavedRequestMethod}
            setRequestMethod={setUnsavedRequestMethod}
            requestId={request.id}
          />
          <SendButton onNormalSend={handleNormalSend} />
          <SaveButton
            needSave={needSave}
            onSave={handleSave}
            onSaveAs={() => setShowSaveAsDialog(true)}
          />
        </Stack>
        <CustomTabs
          value={activeTabIndex}
          onChange={setActiveTabIndex}
          names={['Parameters', 'Body', 'Headers', 'Auth']}
        />
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
          <AuthPanel
            auth={unsavedAuth}
            setAuth={setUnsavedAuth}
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
