/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from 'react'

import {
  Auth,
  ExecutionOptions,
  ExecutionScript,
  Folder,
  oauth2LoadLocal,
} from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import FolderIcon from '@mui/icons-material/Folder'
import {
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { useHashSumModule } from 'src/contexts/imports'
import {
  useCollectionVariables,
  useEnvironmentVariables,
} from 'src/contexts/VariablesProvider'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { clientSideGenerator } from 'src/test-manager'
import { jobQueueVar } from 'src/test-manager'
import { guardOAuth2Save } from 'src/utils/oauth2/oauth2-guards'

import {
  getDescription,
  getExecutionScripts,
  useUnsavedDescription,
  useUnsavedExecutionOptions,
  useUnsavedExecutionScripts,
} from '../../../hooks'
import { duplicateRecursive } from '../../LeftAside/CollectionTree/Node/utils'
import { PanelLayout } from '../../PanelLayout'
import { AuthPanel } from '../../sub-panels/AuthPanel'
import { DescriptionPanel } from '../../sub-panels/DescriptionPanel'
import { ExecutionOptionsPanel } from '../../sub-panels/ExecutionOptionsPanel'
import { ScriptsPanel } from '../../sub-panels/ScriptsPanel'
import { SaveButton } from '../components/SaveButton'
import { SendButton } from '../components/SendButton'

import { SaveAsDialog } from './SaveAsDialog'

type FolderInputPanelProps = {
  folderId: string
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
}

export const FolderInputPanel = ({
  folderId,
  collectionYMap,
  setObservedNeedsSave,
}: FolderInputPanelProps) => {
  const { default: hash } = useHashSumModule()

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const foldersYMap = collectionYMap.get('folders')
  const restRequestsYMap = collectionYMap.get('restRequests')

  const folderYMap = foldersYMap.get(folderId)
  const folderHook = useYMap(folderYMap)

  const [unsavedDescription, setUnsavedDescription] =
    useUnsavedDescription(folderYMap)

  const {
    unsavedExecutionScripts,
    setUnsavedExecutionScripts,
    defaultExecutionScript,
  } = useUnsavedExecutionScripts(folderYMap, true)

  const [unsavedExecutionOptions, setUnsavedExecutionOptions] =
    useUnsavedExecutionOptions(folderYMap)

  const getSetAuth = () => {
    folderYMap.set('auth', {
      authType: 'inherit',
    })

    return folderYMap.get('auth')
  }

  const [unsavedAuth, setUnsavedAuth] = useState<Auth>(
    oauth2LoadLocal(folderYMap.get('auth'), folderId) ?? getSetAuth()
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // If doesn't need save, update fields automatically
  useEffect(() => {
    if (needSave) {
      return
    }

    setUnsavedDescription(getDescription(folderYMap))

    const newAuth = oauth2LoadLocal(folderYMap.get('auth'), folderId)

    // This is necessary to prevent a feedback loop
    if (hash(unsavedAuth) !== hash(newAuth)) {
      setUnsavedAuth(JSON.parse(JSON.stringify(newAuth)))
    }

    const newExecutionScripts = getExecutionScripts(folderYMap, true)

    // This is necessary to prevent a feedback loop
    if (hash(unsavedExecutionScripts) !== hash(newExecutionScripts)) {
      setUnsavedExecutionScripts(newExecutionScripts)
    }

    // This seems to be required to trigger re-render in some cases
    setNeedSave(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderHook])

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

  const handleSave = () => {
    folderYMap.set('description', unsavedDescription)
    folderYMap.set('auth', guardOAuth2Save(unsavedAuth, folderId))
    folderYMap.set(
      'executionScripts',
      unsavedExecutionScripts.filter((s) => !s.builtIn)
    )
    folderYMap.set('executionOptions', unsavedExecutionOptions)

    folderYMap.set('updatedAt', new Date().toISOString())
    setNeedSave(false)
  }

  const saveCallbackRef = useRef<() => void>(handleSave)
  saveCallbackRef.current = handleSave

  const handleSaveAs = (newName: string) => {
    const newId = uuid()

    duplicateRecursive({
      nodeYMap: folderYMap,
      foldersYMap,
      restRequestsYMap,
      newId,
    })

    const newFolder = foldersYMap.get(newId)

    newFolder.set('name', newName)
    newFolder.set('auth', guardOAuth2Save(unsavedAuth, newId))
    newFolder.set('description', unsavedDescription)
    newFolder.set(
      'executionScripts',
      unsavedExecutionScripts.filter((s) => !s.builtIn)
    )

    newFolder.set('executionOptions', unsavedExecutionOptions)
  }

  const environmentContext = useEnvironmentVariables()
  const collectionContext = useCollectionVariables()
  const jobQueue = useReactiveVar(jobQueueVar)

  const handleSend = async (executionScript: ExecutionScript) => {
    if (!scopeId) throw new Error('No scopeId')
    if (!rawBearer) throw new Error('No rawBearer')

    const folder: Folder = {
      id: folderId,
      __typename: 'Folder',
      parentId: folderYMap.get('parentId'),
      __parentTypename: folderYMap.get('__parentTypename'),
      orderingIndex: folderYMap.get('orderingIndex'),
      createdAt: folderYMap.get('createdAt'),
      updatedAt: folderYMap.get('updatedAt'),
      name: folderYMap.get('name'),
      auth: unsavedAuth,
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
        nodeYMap: folderYMap,
        executionScript,
        firstLevelData: {
          variant: 'group',
          subVariant: 'Folder',
          folder,
        },
        oauthLocalSaveKey: folderId,
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } catch (e: {
      message: string
    }) {
      snackErrorMessageVar(e.message)
    }
  }

  useEffect(() => {
    if (needSave) {
      setObservedNeedsSave(true, () => saveCallbackRef.current())
      return
    }

    setObservedNeedsSave(false)
  }, [needSave, setObservedNeedsSave, saveCallbackRef])

  return (
    <>
      <PanelLayout
        tabNames={['Auth', 'Scripts', 'Description', 'Options']}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
        aboveTabsArea={
          <Stack
            direction="row"
            sx={{
              width: '100%',
              maxWidth: '100%',
            }}
            alignItems="center"
            justifyContent="space-between"
          >
            <ListItem
              sx={{
                padding: 0,
                paddingLeft: 1.5,
                margin: 0,
                MarginTop: -2,
              }}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    fontWeight="bold"
                    fontSize="large"
                    sx={{
                      userSelect: 'none',
                    }}
                  >
                    {folderYMap.get('name')}
                  </Typography>
                }
                sx={{
                  marginLeft: -2,
                  marginY: 0,
                }}
              />
            </ListItem>
            <Box marginLeft={2} />
            <SendButton
              onSend={handleSend}
              executionScripts={unsavedExecutionScripts}
              defaultExecutionScript={defaultExecutionScript}
              buttonName="Run"
            />
            <Box marginLeft={2} />
            <SaveButton
              needSave={needSave}
              onSave={handleSave}
              onSaveAs={() => setShowSaveAsDialog(true)}
            />
          </Stack>
        }
      >
        {activeTabIndex === 0 && (
          <AuthPanel
            auth={unsavedAuth}
            setAuth={(newValue) =>
              handleFieldUpdate<Auth>(setUnsavedAuth, newValue)
            }
            namespace={`folders.${folderId}.auth`}
            setActionArea={setActionArea}
            oauthLocalSaveKey={folderId}
          />
        )}
        {activeTabIndex === 1 && (
          <ScriptsPanel
            executionScripts={unsavedExecutionScripts}
            setExecutionScripts={(newScripts) =>
              handleFieldUpdate<ExecutionScript[]>(
                setUnsavedExecutionScripts,
                newScripts
              )
            }
            namespace={`folder:${folderId}:scripts`}
            setActionArea={setActionArea}
            onExecute={handleSend}
          />
        )}
        {activeTabIndex === 2 && (
          <DescriptionPanel
            description={unsavedDescription}
            setDescription={(newValue) =>
              handleFieldUpdate<string>(setUnsavedDescription, newValue)
            }
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 3 && (
          <ExecutionOptionsPanel
            executionOptions={unsavedExecutionOptions}
            setExecutionOptions={(newOptions) =>
              handleFieldUpdate<ExecutionOptions>(
                setUnsavedExecutionOptions,
                newOptions
              )
            }
            setActionArea={setActionArea}
            namespace={`folders.${folderId}.executionOptions`}
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
