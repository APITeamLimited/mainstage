import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Box, Stack } from '@mui/material'
import { Environment, RESTRequest } from '@apiteam/types'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { restRequestQueueVar } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'
import { useScopes } from 'src/entity-engine/EntityEngine'
import { singleRESTRequestGenerator } from 'src/globe-test'
import { jobQueueVar } from 'src/globe-test/lib'

import { CustomTabs } from '../../CustomTabs'
import { KeyValueEditor } from '../KeyValueEditor'
import { PanelLayout } from '../PanelLayout'

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
  const workspace = useWorkspace()
  const scopes = useScopes()

  // Although we are not using these, they ensure ui updates when the ymaps change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const restRequests = useYMap(restRequestsYMap || new Y.Map())

  const [requestYMap, setRequestYMap] = useState<Y.Map<any>>(
    restRequests.get(requestId) || new Y.Map()
  )

  useEffect(() => {
    setRequestYMap(restRequests.get(requestId) || new Y.Map())
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
  const jobQueue = useReactiveVar(jobQueueVar)
  const queue = useReactiveVar(restRequestQueueVar)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironment = useYMap(activeEnvironmentYMap || new Y.Map())

  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    if (!needSave) {
      setNeedSave(
        JSON.stringify(unsavedEndpoint) !==
          JSON.stringify(requestYMap.get('endpoint')) ||
          JSON.stringify(unsavedHeaders) !==
            JSON.stringify(requestYMap.get('headers')) ||
          JSON.stringify(unsavedParameters) !==
            JSON.stringify(requestYMap.get('params')) ||
          JSON.stringify(unsavedBody) !==
            JSON.stringify(requestYMap.get('body')) ||
          JSON.stringify(unsavedRequestMethod) !==
            JSON.stringify(requestYMap.get('method')) ||
          JSON.stringify(unsavedAuth) !==
            JSON.stringify(requestYMap.get('auth'))
      )
    }
  }, [
    needSave,
    requestYMap,
    unsavedAuth,
    unsavedBody,
    unsavedEndpoint,
    unsavedHeaders,
    unsavedParameters,
    unsavedRequestMethod,
  ])

  const handleSave = () => {
    requestYMap.set('endpoint', unsavedEndpoint)
    requestYMap.set('headers', unsavedHeaders)
    requestYMap.set('params', unsavedParameters)
    requestYMap.set('body', unsavedBody)
    requestYMap.set('method', unsavedRequestMethod)
    requestYMap.set('auth', unsavedAuth)
    setNeedSave(false)
  }

  const handleSaveAs = (newName: string) => {
    const newId = uuid()
    const clone = requestYMap.clone()
    clone.set('id', newId)
    clone.set('name', newName)
    clone.set('endpoint', unsavedEndpoint)
    clone.set('headers', unsavedHeaders)
    clone.set('params', unsavedParameters)
    clone.set('body', unsavedBody)
    clone.set('method', unsavedRequestMethod)
    clone.set('auth', unsavedAuth)
    const parent = requestYMap.parent
    if (!parent) throw 'No parent found'
    parent.set(newId, clone)
  }

  const handleNormalSend = () => {
    const request: RESTRequest = {
      id: requestYMap.get('id'),
      __typename: 'RESTRequest',
      parentId: requestYMap.get('parentId'),
      __parentTypename: requestYMap.get('__parentTypename'),
      orderingIndex: requestYMap.get('orderingIndex'),
      createdAt: new Date(requestYMap.get('createdAt')),
      updatedAt: requestYMap.get('updatedAt')
        ? new Date(requestYMap.get('updatedAt'))
        : null,
      name: requestYMap.get('name'),
      endpoint: unsavedEndpoint,
      headers: unsavedHeaders,
      params: unsavedParameters,
      body: unsavedBody,
      method: unsavedRequestMethod,
      auth: unsavedAuth,
    }

    // Find scope matching workspace guid
    const [variant, variantTargetId] = workspace?.guid.split(
      ':'
    ) as Array<string>

    const scopeId = scopes?.find(
      (scope) =>
        scope.variant === variant && scope.variantTargetId === variantTargetId
    )?.id

    if (!scopeId) throw 'No scope found'

    singleRESTRequestGenerator({
      request,
      activeEnvironment: activeEnvironment.data as unknown as Environment,
      // Normal send is always main scope i.e. workspace
      scopeId,
      jobQueue,
      requestYMap,
    })
  }

  return (
    <>
      <PanelLayout
        aboveTabsArea={
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
            <Box marginLeft={2} />
            <SendButton onNormalSend={handleNormalSend} />
            <Box marginLeft={2} />
            <SaveButton
              needSave={needSave}
              onSave={handleSave}
              onSaveAs={() => setShowSaveAsDialog(true)}
            />
          </Stack>
        }
        tabNames={['Parameters', 'Body', 'Headers', 'Auth']}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
      >
        {activeTabIndex === 0 && (
          <KeyValueEditor
            items={unsavedParameters}
            setItems={setUnsavedParameters}
            namespace={requestId}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 1 && (
          <BodyPanel
            requestId={requestId}
            body={unsavedBody}
            setBody={setUnsavedBody}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 2 && (
          <KeyValueEditor
            items={unsavedHeaders}
            setItems={setUnsavedHeaders}
            namespace={requestId}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 3 && (
          <AuthPanel
            auth={unsavedAuth}
            setAuth={setUnsavedAuth}
            requestId={requestId}
            setActionArea={setActionArea}
          />
        )}
      </PanelLayout>
      <SaveAsDialog
        open={showSaveAsDialog}
        onClose={() => setShowSaveAsDialog(false)}
        onSave={handleSaveAs}
      />
    </>
  )
}
