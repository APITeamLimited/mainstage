import { useEffect, useState } from 'react'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { useReactiveVar } from '@apollo/client'
import { Box, Stack } from '@mui/material'
import { useYMap } from 'zustand-yjs'

import {
  addToQueue,
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
  requestId: string
  collectionYMap: Y.Map<any>
}

export const RESTInputPanel = ({
  requestId,
  collectionYMap,
}: RESTInputPanelProps) => {
  const restRequestsYMap = collectionYMap.get('restRequests')

  // Although we are not using these, they ensure ui updates when the ymaps change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const restRequests = useYMap(restRequestsYMap)

  const [requestYMap, setRequestYMap] = useState<Y.Map<any> | null>(
    restRequests.get(requestId)
  )

  useEffect(() => {
    setRequestYMap(restRequests.get(requestId))
  }, [requestId, restRequests])

  const [unsavedEndpoint, setUnsavedEndpoint] = useState(
    requestYMap.get('endpoint')
  )
  const [unsavedHeaders, setUnsavedHeaders] = useState(
    requestYMap.get('headers')
  )
  const [unsavedParameters, setUnsavedParameters] = useState(
    requestYMap.get('params')
  )
  const [unsavedBody, setUnsavedBody] = useState(requestYMap.get('body'))
  const [unsavedRequestMethod, setUnsavedRequestMethod] = useState(
    requestYMap.get('method')
  )
  const [unsavedAuth, setUnsavedAuth] = useState(requestYMap.get('auth'))

  const queue = useReactiveVar(restRequestQueueVar)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  console.log('rest input panel', requestYMap)

  // If request changes, update unsaved request
  useEffect(() => {
    setUnsavedEndpoint(requestYMap.get('endpoint'))
    setUnsavedHeaders(requestYMap.get('headers'))
    setUnsavedParameters(requestYMap.get('params'))
    setUnsavedBody(requestYMap.get('body'))
    setUnsavedRequestMethod(requestYMap.get('method'))
    setUnsavedAuth(requestYMap.get('auth'))
  }, [requestYMap])

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    setNeedSave(
      unsavedEndpoint !== requestYMap.get('endpoint') ||
        unsavedHeaders !== requestYMap.get('headers') ||
        unsavedParameters !== requestYMap.get('params') ||
        unsavedBody !== requestYMap.get('body') ||
        unsavedRequestMethod !== requestYMap.get('method') ||
        unsavedAuth !== requestYMap.get('auth')
    )
  }, [
    requestYMap,
    unsavedAuth,
    unsavedBody,
    unsavedEndpoint,
    unsavedHeaders,
    unsavedParameters,
    unsavedRequestMethod,
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
    console.log('Saved request', newRequest)
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
        margin={2}
        spacing={2}
        sx={{
          height: 'calc(100% - 2em)',
          maxHeight: 'calc(100% - 2em)',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <EndpointBox
            unsavedEndpoint={unsavedEndpoint}
            setUnsavedEndpoint={(e) => setUnsavedEndpoint(e)}
            requestMethod={unsavedRequestMethod}
            setRequestMethod={setUnsavedRequestMethod}
            requestId={requestId}
          />
          <Box marginLeft={1} />
          <SendButton onNormalSend={handleNormalSend} />
          <Box marginLeft={1} />
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
            requestId={requestId}
          />
        )}
        {activeTabIndex === 1 && (
          <BodyPanel body={unsavedBody} setBody={setUnsavedBody} />
        )}
        {activeTabIndex === 2 && (
          <HeadersPanel
            headers={unsavedHeaders}
            setHeaders={setUnsavedHeaders}
            requestId={requestId}
          />
        )}
        {activeTabIndex === 3 && (
          <AuthPanel
            auth={unsavedAuth}
            setAuth={setUnsavedAuth}
            requestId={requestId}
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
