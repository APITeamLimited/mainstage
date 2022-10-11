/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { KeyValueItem } from '@apiteam/types'
import { RESTReqBody } from '@apiteam/types'
import { RESTAuth, RESTRequest } from '@apiteam/types'
import { ExecutionScript } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import { Box, Stack } from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { KeyValueEditor } from 'src/components/app/KeyValueEditor'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useYJSModule, useHashSumModule } from 'src/contexts/imports'
import { useWorkspace } from 'src/entity-engine'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { singleRESTRequestGenerator } from 'src/globe-test'
import { jobQueueVar } from 'src/globe-test/lib'
import { useYMap } from 'src/lib/zustand-yjs'
import { BUILTIN_REST_SCRIPTS } from 'src/utils/rest-scripts'
import { stripBodyStoredObjectData } from 'src/utils/rest-utils'

import { DescriptionPanel } from '../DescriptionPanel'
import { PanelLayout } from '../PanelLayout'

import { AuthPanel } from './AuthPanel'
import { BodyPanel } from './BodyPanel'
import { EndpointBox } from './EndpointBox'
import { ParametersPanel } from './ParametersPanel'
import { SaveAsDialog } from './SaveAsDialog'
import { SaveButton } from './SaveButton'
import { ScriptsPanel } from './ScriptsPanel'
import { SendButton } from './SendButton'
import { generatePathVariables } from './utils'

const defaultExecutionScript = BUILTIN_REST_SCRIPTS.find(
  (script) => script.name === 'rest-single.js'
)
if (!defaultExecutionScript) {
  throw new Error('Default rest execution script not found')
}

type RESTInputPanelProps = {
  requestYMap: YMap<any>
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean) => void
  tabId: string
}

export const RESTInputPanel = ({
  requestYMap,
  collectionYMap,
  tabId,
  setObservedNeedsSave,
}: RESTInputPanelProps) => {
  const Y = useYJSModule()
  const { default: hash } = useHashSumModule()

  const collectionHook = useYMap(collectionYMap)

  const restRequestsYMap = useMemo(
    () => collectionYMap.get('restRequests'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collectionHook]
  )

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const requestHook = useYMap(requestYMap)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const requestId = useMemo(() => requestYMap.get('id'), [requestHook])

  const [unsavedEndpoint, setUnsavedEndpoint] = useState<string>(
    requestYMap.get('endpoint')
  )
  const [unsavedHeaders, setUnsavedHeaders] = useState(
    requestYMap.get('headers')
  )
  const [unsavedParameters, setUnsavedParameters] = useState(
    requestYMap.get('params')
  )

  const getAndSetPathVariables = () => {
    const pathVariables = generatePathVariables({
      requestYMap,
      unsavedEndpoint,
    })
    requestYMap.set('pathVariables', pathVariables)
    return requestYMap.get('pathVariables')
  }

  const [unsavedPathVariables, setUnsavedPathVariables] = useState<
    KeyValueItem[]
  >(requestYMap.get('pathVariables') ?? getAndSetPathVariables())

  useEffect(() => {
    const generatedPathVariables = generatePathVariables({
      requestYMap,
      unsavedEndpoint,
    })

    if (hash(unsavedPathVariables) !== hash(generatedPathVariables)) {
      setUnsavedPathVariables(generatedPathVariables)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedEndpoint])

  const [unsavedBody, setUnsavedBody] = useState<RESTReqBody>(
    requestYMap.get('body')
  )
  const [unsavedRequestMethod, setUnsavedRequestMethod] = useState(
    requestYMap.get('method')
  )
  const [unsavedAuth, setUnsavedAuth] = useState<RESTAuth>(
    requestYMap.get('auth')
  )

  const getSetDescription = () => {
    requestYMap.set('description', '')
    return requestYMap.get('description')
  }

  const [unsavedDescription, setUnsavedDescription] = useState<string>(
    requestYMap.get('description') ?? getSetDescription()
  )

  const getAndSetExecutionScripts = () => {
    requestYMap.set('executionScripts', [])
    return requestYMap.get('executionScripts')
  }

  const [unsavedExecutionScripts, setUnsavedExecutionScripts] = useState<
    ExecutionScript[]
  >(requestYMap.get('executionScripts') ?? getAndSetExecutionScripts())

  const jobQueue = useReactiveVar(jobQueueVar)

  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  useYMap(activeEnvironmentYMap || new Y.Map())

  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  const [mountTime] = useState(Date.now())

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    if (!needSave && Date.now() - mountTime > 100) {
      const needsSave =
        hash(unsavedEndpoint) !== hash(requestYMap.get('endpoint')) ||
        hash(unsavedHeaders) !== hash(requestYMap.get('headers')) ||
        hash(unsavedParameters) !== hash(requestYMap.get('params')) ||
        hash(stripBodyStoredObjectData(unsavedBody)) !==
          hash(requestYMap.get('body')) ||
        hash(unsavedRequestMethod) !== hash(requestYMap.get('method')) ||
        hash(unsavedAuth) !== hash(requestYMap.get('auth')) ||
        hash(unsavedDescription) !== hash(requestYMap.get('description')) ||
        hash(unsavedPathVariables) !== hash(requestYMap.get('pathVariables')) ||
        hash(unsavedExecutionScripts) !==
          hash(requestYMap.get('executionScripts'))

      if (needsSave) {
        setNeedSave(true)
        setObservedNeedsSave(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    needSave,
    requestYMap,
    unsavedAuth,
    unsavedBody,
    unsavedDescription,
    unsavedEndpoint,
    unsavedHeaders,
    unsavedParameters,
    unsavedPathVariables,
    unsavedRequestMethod,
    unsavedExecutionScripts,
  ])

  useEffect(() => {
    if (!unsavedBody) return

    // If unsaved body is a stored object and changes, immeditely save
    if (unsavedBody.contentType === 'application/octet-stream') {
      requestYMap.set('body', unsavedBody)
    }
  }, [requestYMap, unsavedBody])

  const handleSave = () => {
    requestYMap.set('endpoint', unsavedEndpoint)
    requestYMap.set('headers', unsavedHeaders)
    requestYMap.set('params', unsavedParameters)
    requestYMap.set('body', stripBodyStoredObjectData(unsavedBody))
    requestYMap.set('method', unsavedRequestMethod)
    requestYMap.set('auth', unsavedAuth)
    requestYMap.set('description', unsavedDescription)
    requestYMap.set('pathVariables', unsavedPathVariables)
    requestYMap.set('executionScripts', unsavedExecutionScripts)
    setNeedSave(false)
    setObservedNeedsSave(false)
  }

  const handleSaveAs = (newName: string) => {
    const newId = uuid()
    const clone = requestYMap.clone()
    clone.set('id', newId)
    clone.set('name', newName)
    clone.set('endpoint', unsavedEndpoint)
    clone.set('headers', unsavedHeaders)
    clone.set('params', unsavedParameters)
    clone.set('body', stripBodyStoredObjectData(unsavedBody))
    clone.set('method', unsavedRequestMethod)
    clone.set('auth', unsavedAuth)
    clone.set('description', unsavedDescription)
    clone.set('pathVariables', unsavedPathVariables)
    clone.set('executionScripts', unsavedExecutionScripts)
    restRequestsYMap.set(newId, clone)
  }

  const handleSend = async (executionScript: ExecutionScript) => {
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
      pathVariables: unsavedPathVariables,
      description: unsavedDescription,
      executionScripts: unsavedExecutionScripts,
    }

    if (!scopeId) throw new Error('No scopeId')
    if (!rawBearer) throw new Error('No rawBearer')

    singleRESTRequestGenerator({
      request,
      activeEnvironmentYMap,
      collectionYMap,
      // Normal send is always main scope i.e. workspace
      scopeId,
      jobQueue,
      requestYMap,
      executionScript,
    })
  }

  const sendScripts = useMemo(
    () => [...BUILTIN_REST_SCRIPTS, ...unsavedExecutionScripts],
    [unsavedExecutionScripts]
  )

  const spawnId = useMemo(() => uuid(), [])

  return (
    <>
      <PanelLayout
        aboveTabsArea={
          <Stack
            direction="row"
            sx={{
              width: '100%',
              maxWidth: '100%',
              height: '2.5rem',
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
            <SendButton
              onSend={handleSend}
              executionScripts={sendScripts}
              defaultExecutionScript={defaultExecutionScript}
            />
            <Box marginLeft={2} />
            <SaveButton
              needSave={needSave}
              onSave={handleSave}
              onSaveAs={() => setShowSaveAsDialog(true)}
            />
          </Stack>
        }
        tabNames={[
          'Parameters',
          'Body',
          'Headers',
          'Auth',
          'Scripts',
          'Description',
        ]}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
      >
        {activeTabIndex === 0 && (
          <ParametersPanel
            queryParameters={unsavedParameters}
            pathVariables={unsavedPathVariables}
            setQueryParameters={setUnsavedParameters}
            setPathVariables={setUnsavedPathVariables}
            namespace={`request:${requestId}:params`}
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
            namespace={`request:${requestId}:headers`}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 3 && (
          <AuthPanel
            auth={unsavedAuth}
            setAuth={setUnsavedAuth}
            namespace={requestId}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 4 && (
          <ScriptsPanel
            executionScripts={unsavedExecutionScripts}
            setExecutionScripts={setUnsavedExecutionScripts}
            namespace={spawnId}
            setActionArea={setActionArea}
            onExecute={handleSend}
          />
        )}
        {activeTabIndex === 5 && (
          <DescriptionPanel
            description={unsavedDescription}
            setDescription={setUnsavedDescription}
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
