import { useCallback, useEffect, useState } from 'react'

import { RESTReqBody } from '@apiteam/types/src'
import { RESTAuth, RESTRequest } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import { Box, Stack } from '@mui/material'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useWorkspace } from 'src/entity-engine'
import {
  useRawBearer,
  useScopeId,
  useScopes,
} from 'src/entity-engine/EntityEngine'
import { singleRESTRequestGenerator } from 'src/globe-test'
import { jobQueueVar } from 'src/globe-test/lib'
import { retrieveScopedResource } from 'src/store'

import { DescriptionPanel } from '../DescriptionPanel'
import { KeyValueEditor } from '../KeyValueEditor'
import { PanelLayout } from '../PanelLayout'

import { AuthPanel } from './AuthPanel'
import { BodyPanel } from './BodyPanel'
import { EndpointBox } from './EndpointBox'
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
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const requestYMap = restRequestsYMap.get(requestId)

  const [unsavedEndpoint, setUnsavedEndpoint] = useState(
    requestYMap.get('endpoint')
  )
  const [unsavedHeaders, setUnsavedHeaders] = useState(
    requestYMap.get('headers')
  )
  const [unsavedParameters, setUnsavedParameters] = useState(
    requestYMap.get('params')
  )
  const [unsavedPathVariables, setUnsavedPathVariables] = useState(
    requestYMap.get('pathVariables') || []
  )

  const [firstSetPathVariables, setFirstSetPathVariables] = useState(false)

  useEffect(() => {
    // Scan for path variables with colon after the slash
    const pathVariables: string[] = []
    const path = unsavedEndpoint.split('?')[0]
    const pathParts = path.split('/') as string[]
    pathParts.forEach((part) => {
      // Ignore empty parts
      if (part.startsWith(':')) {
        pathVariables.push(part.substring(1))
      }
    })

    // Ignore if already set in pathVariables else set
    const pathVariablesSet = new Set(
      pathVariables.filter((pathVariable) => pathVariable !== '')
    ) as Set<string>

    const newPathVariables = Array.from(pathVariablesSet).map(
      (pathVariable, index) => ({
        id: index,
        keyString: pathVariable,
        value: '',
        enabled: true,
      })
    )

    if (!firstSetPathVariables) {
      requestYMap.set('pathVariables', newPathVariables)
      setFirstSetPathVariables(true)
    }

    setUnsavedPathVariables(newPathVariables)

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

  const jobQueue = useReactiveVar(jobQueueVar)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  useYMap(activeEnvironmentYMap || new Y.Map())

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
          JSON.stringify(stripBodyStoredObjectData(unsavedBody)) !==
            JSON.stringify(requestYMap.get('body')) ||
          JSON.stringify(unsavedRequestMethod) !==
            JSON.stringify(requestYMap.get('method')) ||
          JSON.stringify(unsavedAuth) !==
            JSON.stringify(requestYMap.get('auth')) ||
          JSON.stringify(unsavedDescription) !==
            JSON.stringify(requestYMap.get('description')) ||
          JSON.stringify(unsavedPathVariables) !==
            JSON.stringify(requestYMap.get('pathVariables'))
      )
    }
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
  ])

  const fetchScopedBody = useCallback(async () => {
    /*if (unsavedBody.contentType === 'multipart/form-data') {
      setUnsavedBody({
        ...unsavedBody,
        ...(await Promise.all(
          unsavedBody.body.map(async (part) => {
            if (part.fileField && part.fileField.data.data === null) {
              if (!scopeId) throw new Error('No scopeId')
              if (!rawBearer) throw new Error('No rawBearer')

              const { data } = await retrieveScopedResource({
                scopeId,
                rawBearer,
                storeReceipt: part.fileField.data.storeReceipt,
              })

              return {
                ...part,
                fileField: {
                  ...part.fileField,
                  data: {
                    ...part.fileField.data,
                    data,
                  },
                },
              }
            } else {
              return part
            }
          })
        )),
      })
    }*/
  }, [rawBearer, scopeId, unsavedBody])

  useEffect(() => {
    if (!unsavedBody) return

    // If unsaved body is a stored object and changes, immeditely save
    if (unsavedBody.contentType === 'application/octet-stream') {
      requestYMap.set('body', unsavedBody)
    }
  }, [requestYMap, unsavedBody])

  const stripBodyStoredObjectData = (
    unfilteredBody: RESTReqBody
  ): RESTReqBody => {
    if (unfilteredBody.contentType === 'application/octet-stream') {
      if (unfilteredBody.body === null) {
        return unfilteredBody
      }

      return {
        contentType: unfilteredBody.contentType,
        body: {
          data: {
            ...unfilteredBody.body.data,
            data: null,
          },
          filename: unfilteredBody.body.filename,
        },
      }
    }

    if (unfilteredBody.contentType === 'multipart/form-data') {
      return {
        contentType: unfilteredBody.contentType,
        body: unfilteredBody.body.map((part) => {
          if (part.fileField) {
            return {
              ...part,
              fileField: {
                ...part.fileField,
                data: {
                  ...part.fileField.data,
                  data: null,
                },
              },
            }
          } else {
            return part
          }
        }),
      }
    }

    return unfilteredBody
  }

  const handleSave = () => {
    requestYMap.set('endpoint', unsavedEndpoint)
    requestYMap.set('headers', unsavedHeaders)
    requestYMap.set('params', unsavedParameters)
    requestYMap.set('body', stripBodyStoredObjectData(unsavedBody))
    requestYMap.set('method', unsavedRequestMethod)
    requestYMap.set('auth', unsavedAuth)
    requestYMap.set('description', unsavedDescription)
    requestYMap.set('pathVariables', unsavedPathVariables)
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
    clone.set('body', stripBodyStoredObjectData(unsavedBody))
    clone.set('method', unsavedRequestMethod)
    clone.set('auth', unsavedAuth)
    clone.set('description', unsavedDescription)
    clone.set('pathVariables', unsavedPathVariables)
    restRequestsYMap.set(newId, clone)
  }

  const handleNormalSend = async () => {
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
    }

    if (!scopeId) throw new Error('No scopeId')
    if (!rawBearer) throw new Error('No rawBearer')

    singleRESTRequestGenerator({
      request,
      activeEnvironmentYMap,
      collectionYMap,
      // Normal send is always main scope i.e. workspace
      scopeId,
      rawBearer,
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
        tabNames={['Parameters', 'Body', 'Headers', 'Auth', 'Description']}
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
