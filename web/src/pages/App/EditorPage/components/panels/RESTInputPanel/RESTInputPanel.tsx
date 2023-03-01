/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  DefaultKeyValueItem,
  DefaultKV,
  ExecutionOptions,
  RESTRequestBody,
  oauth2LoadLocal,
} from '@apiteam/types'
import { Auth, RESTRequest } from '@apiteam/types'
import { ExecutionScript } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import { Box, Stack } from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { KeyValueEditor } from 'src/components/app/KeyValueEditor'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useYJSModule, useHashSumModule } from 'src/contexts/imports'
import {
  useCollectionVariables,
  useEnvironmentVariables,
} from 'src/contexts/VariablesProvider'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { clientSideGenerator } from 'src/test-manager'
import { jobQueueVar } from 'src/test-manager/lib'
import { kvLegacyImporter } from 'src/utils/key-values'
import { guardOAuth2Save } from 'src/utils/oauth2/oauth2-guards'
import { stripBodyStoredObjectData } from 'src/utils/rest-utils'

import {
  getDescription,
  getExecutionScripts,
  useUnsavedDescription,
  useUnsavedExecutionScripts,
  useUnsavedExecutionOptions,
} from '../../../hooks'
import { PanelLayout } from '../../PanelLayout'
import { AuthPanel } from '../../sub-panels/AuthPanel'
import { DescriptionPanel } from '../../sub-panels/DescriptionPanel'
import { ExecutionOptionsPanel } from '../../sub-panels/ExecutionOptionsPanel'
import { ScriptsPanel } from '../../sub-panels/ScriptsPanel'
import { SaveButton } from '../components/SaveButton'
import { SendButton } from '../components/SendButton'

import { BodyPanel } from './BodyPanel'
import { EndpointBox } from './EndpointBox'
import { ParametersPanel } from './ParametersPanel'
import { SaveAsDialog } from './SaveAsDialog'
import { generatePathVariables } from './utils'

type RESTInputPanelProps = {
  requestYMap: YMap<any>
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
}

export const RESTInputPanel = ({
  requestYMap,
  collectionYMap,
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
  const [unsavedHeaders, setUnsavedHeaders] = useState<DefaultKeyValueItem[]>(
    kvLegacyImporter<DefaultKV>('headers', requestYMap, 'default')
  )
  const [unsavedParameters, setUnsavedParameters] = useState<
    DefaultKeyValueItem[]
  >(kvLegacyImporter<DefaultKV>('params', requestYMap, 'default'))

  const [unsavedPathVariables, setUnsavedPathVariables] = useState<
    DefaultKeyValueItem[]
  >(kvLegacyImporter<DefaultKV>('pathVariables', requestYMap, 'default'))

  const [setInitalPathVariables, setSetInitalPathVariables] = useState(false)

  useEffect(() => {
    const generatedPathVariables = generatePathVariables({
      requestYMap,
      unsavedEndpoint,
    })

    if (hash(unsavedPathVariables) !== hash(generatedPathVariables)) {
      if (!setInitalPathVariables) {
        requestYMap.set('pathVariables', generatedPathVariables)
        setSetInitalPathVariables(true)
      } else {
        setUnsavedPathVariables(generatedPathVariables)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedEndpoint])

  const [unsavedBody, setUnsavedBody] = useState<RESTRequestBody>(
    requestYMap.get('body')
  )
  const [unsavedRequestMethod, setUnsavedRequestMethod] = useState<string>(
    requestYMap.get('method')
  )
  const [unsavedAuth, setUnsavedAuth] = useState<Auth>(
    oauth2LoadLocal(requestYMap.get('auth'), requestId)
  )

  const [unsavedDescription, setUnsavedDescription] =
    useUnsavedDescription(requestYMap)

  const {
    unsavedExecutionScripts,
    setUnsavedExecutionScripts,
    defaultExecutionScript,
  } = useUnsavedExecutionScripts(requestYMap, false)

  const [unsavedExecutionOptions, setUnsavedExecutionOptions] =
    useUnsavedExecutionOptions(requestYMap)

  const jobQueue = useReactiveVar(jobQueueVar)

  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const activeEnvironmentYMap = useActiveEnvironmentYMap()

  useYMap(activeEnvironmentYMap ?? new Y.Map())

  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // If doesn't need save, update fields automatically
  useEffect(() => {
    if (needSave) {
      return
    }

    setUnsavedEndpoint(requestYMap.get('endpoint'))

    const newHeaders = kvLegacyImporter<DefaultKV>(
      'headers',
      requestYMap,
      'default'
    )

    // This is necessary to prevent a feedback loop
    if (hash(unsavedHeaders) !== hash(newHeaders)) {
      setUnsavedHeaders(newHeaders)
    }

    const newParameters = kvLegacyImporter<DefaultKV>(
      'params',
      requestYMap,
      'default'
    )

    if (hash(unsavedParameters) !== hash(newParameters)) {
      setUnsavedParameters(newParameters)
    }

    const newPathVariables = kvLegacyImporter<DefaultKV>(
      'pathVariables',
      requestYMap,
      'default'
    )

    // This is necessary to prevent a feedback loop
    if (hash(unsavedPathVariables) !== hash(newPathVariables)) {
      setUnsavedPathVariables(newPathVariables)
    }

    setUnsavedBody(requestYMap.get('body'))
    setUnsavedRequestMethod(requestYMap.get('method'))

    const newAuth = oauth2LoadLocal(requestYMap.get('auth'), requestId)

    // This is necessary to prevent a feedback loop
    if (hash(unsavedAuth) !== hash(newAuth)) {
      setUnsavedAuth(JSON.parse(JSON.stringify(newAuth)))
    }

    setUnsavedDescription(getDescription(requestYMap))

    const newExecutionScripts = getExecutionScripts(requestYMap, false)

    // This is necessary to prevent a feedback loop
    if (hash(unsavedExecutionScripts) !== hash(newExecutionScripts)) {
      setUnsavedExecutionScripts(newExecutionScripts)
    }

    // This seems to be required to trigger re-render in some cases
    setNeedSave(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestHook])

  const handleSave = () => {
    requestYMap.set('endpoint', unsavedEndpoint)
    // As headers and params are not localvalues don't need to use kvExporter
    requestYMap.set('headers', unsavedHeaders)
    requestYMap.set('params', unsavedParameters)
    requestYMap.set('body', stripBodyStoredObjectData(unsavedBody))
    requestYMap.set('method', unsavedRequestMethod)
    requestYMap.set('auth', guardOAuth2Save(unsavedAuth, requestId))
    requestYMap.set('description', unsavedDescription)
    requestYMap.set('pathVariables', unsavedPathVariables)
    requestYMap.set(
      'executionScripts',
      unsavedExecutionScripts.filter((s) => !s.builtIn)
    )
    requestYMap.set('executionOptions', unsavedExecutionOptions)
    requestYMap.set('updatedAt', new Date().toISOString())
    setNeedSave(false)
    setObservedNeedsSave(false)
  }

  const saveCallbackRef = useRef<() => void>(handleSave)
  saveCallbackRef.current = handleSave

  useEffect(() => {
    if (needSave) {
      setObservedNeedsSave(true, () => saveCallbackRef.current())
      return
    }

    setObservedNeedsSave(false)
  }, [needSave, setObservedNeedsSave, saveCallbackRef])

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  const handleFieldUpdate = <T extends any>(
    setter: (value: T) => void,
    newValue: T
  ) => {
    if (!needSave) {
      setNeedSave(true)
    }

    // Call the setter after the needSave state is set to true else will try and
    // update fields automatically
    setter(newValue)
  }

  const handleSaveAs = (newName: string) => {
    const newId = uuid()

    const clone = requestYMap.clone()

    clone.set('id', newId)
    clone.set('name', newName)
    clone.set('endpoint', unsavedEndpoint)
    // As headers and params are not localvalues don't need to use kvExporter
    clone.set('headers', unsavedHeaders)
    clone.set('params', unsavedParameters)
    clone.set('body', stripBodyStoredObjectData(unsavedBody))
    clone.set('method', unsavedRequestMethod)
    clone.set('auth', guardOAuth2Save(unsavedAuth, newId))
    clone.set('description', unsavedDescription)
    clone.set('pathVariables', unsavedPathVariables)
    clone.set(
      'executionScripts',
      unsavedExecutionScripts.filter((s) => !s.builtIn)
    )
    clone.set('executionOptions', unsavedExecutionOptions)

    restRequestsYMap.set(newId, clone)
  }

  const environmentContext = useEnvironmentVariables()
  const collectionContext = useCollectionVariables()

  const handleSend = async (executionScript: ExecutionScript) => {
    if (!scopeId) throw new Error('No scopeId')
    if (!rawBearer) throw new Error('No rawBearer')

    const request: RESTRequest = {
      id: requestYMap.get('id'),
      __typename: 'RESTRequest',
      parentId: requestYMap.get('parentId'),
      __parentTypename: requestYMap.get('__parentTypename'),
      orderingIndex: requestYMap.get('orderingIndex'),
      createdAt: requestYMap.get('createdAt'),
      updatedAt: requestYMap.get('updatedAt')
        ? requestYMap.get('updatedAt')
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
      executionOptions: unsavedExecutionOptions,
    }

    try {
      await clientSideGenerator({
        executionOptions: unsavedExecutionOptions,
        environmentContext,
        collectionContext,
        collectionYMap,
        // Normal send is always main scope i.e. workspace
        scopeId,
        jobQueue,
        nodeYMap: requestYMap,
        executionScript,
        firstLevelData: {
          variant: 'httpRequest',
          subVariant: 'RESTRequest',
          underlyingRequest: request,
        },
        oauthLocalSaveKey: requestId,
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } catch (e: {
      message: string
    }) {
      snackErrorMessageVar(e.message)
    }
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
              height: '2.5rem',
            }}
            alignItems="center"
          >
            <EndpointBox
              unsavedEndpoint={unsavedEndpoint}
              setUnsavedEndpoint={(newEndpoint) =>
                handleFieldUpdate<string>(setUnsavedEndpoint, newEndpoint)
              }
              requestMethod={unsavedRequestMethod}
              setRequestMethod={(newMethod) =>
                handleFieldUpdate<string>(setUnsavedRequestMethod, newMethod)
              }
              requestId={requestId}
            />
            <Box marginLeft={2} />
            <SendButton
              onSend={handleSend}
              executionScripts={unsavedExecutionScripts}
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
          'Options',
        ]}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
      >
        {activeTabIndex === 0 && (
          <ParametersPanel
            queryParameters={unsavedParameters}
            setQueryParameters={(newParams) =>
              handleFieldUpdate<DefaultKeyValueItem[]>(
                setUnsavedParameters,
                newParams
              )
            }
            pathVariables={unsavedPathVariables}
            setPathVariables={(newPathVariables) =>
              handleFieldUpdate<DefaultKeyValueItem[]>(
                setUnsavedPathVariables,
                newPathVariables
              )
            }
            namespace={`request:${requestId}:params`}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 1 && (
          <BodyPanel
            requestId={requestId}
            body={unsavedBody}
            setBody={(newBody) =>
              handleFieldUpdate<RESTRequestBody>(setUnsavedBody, newBody)
            }
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 2 && (
          <KeyValueEditor
            items={unsavedHeaders}
            setItems={(newHeaders) =>
              handleFieldUpdate<DefaultKeyValueItem[]>(
                setUnsavedHeaders,
                newHeaders
              )
            }
            namespace={`request:${requestId}:headers`}
            setActionArea={setActionArea}
            variant="default"
          />
        )}
        {activeTabIndex === 3 && (
          <AuthPanel
            auth={unsavedAuth}
            setAuth={(newAuth) =>
              handleFieldUpdate<Auth>(setUnsavedAuth, newAuth)
            }
            namespace={`request:${requestId}:auth`}
            setActionArea={setActionArea}
            oauthLocalSaveKey={requestId}
          />
        )}
        {activeTabIndex === 4 && (
          <ScriptsPanel
            executionScripts={unsavedExecutionScripts}
            setExecutionScripts={(newScripts) =>
              handleFieldUpdate<ExecutionScript[]>(
                setUnsavedExecutionScripts,
                newScripts
              )
            }
            namespace={`request:${requestId}:scripts`}
            setActionArea={setActionArea}
            onExecute={handleSend}
          />
        )}
        {activeTabIndex === 5 && (
          <DescriptionPanel
            description={unsavedDescription}
            setDescription={(newDescription) =>
              handleFieldUpdate<string>(setUnsavedDescription, newDescription)
            }
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 6 && (
          <ExecutionOptionsPanel
            executionOptions={unsavedExecutionOptions}
            setExecutionOptions={(newOptions) =>
              handleFieldUpdate<ExecutionOptions>(
                setUnsavedExecutionOptions,
                newOptions
              )
            }
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
