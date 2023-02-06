/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'

import { KeyValueItem, Auth, ExecutionScript } from '@apiteam/types/src'
import {
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import type { Map as YMap } from 'yjs'

import { KeyValueEditor } from 'src/components/app/KeyValueEditor'
import { CollectionEditorIcon } from 'src/components/utils/Icons'
import { useHashSumModule } from 'src/contexts/imports'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { kvExporter, kvLegacyImporter } from 'src/utils/key-values'
import {
  oauth2LoadLocal,
  guardOAuth2Save,
} from 'src/utils/oauth2/oauth2-guards'

import { PanelLayout } from '../../PanelLayout'
import { AuthPanel } from '../../sub-panels/AuthPanel'
import { DescriptionPanel } from '../../sub-panels/DescriptionPanel'
import { ScriptsPanel } from '../../sub-panels/ScriptsPanel'
import { SaveButton } from '../components/SaveButton'
import { SendButton } from '../components/SendButton'
import {
  getDescription,
  getExecutionScripts,
  useUnsavedDescription,
  useUnsavedExecutionScripts,
} from '../hooks'

type CollectionInputPanelProps = {
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
}

export const CollectionInputPanel = ({
  collectionYMap,
  setObservedNeedsSave,
}: CollectionInputPanelProps) => {
  const { default: hash } = useHashSumModule()

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const collectionHook = useYMap(collectionYMap)

  const [unsavedDescription, setUnsavedDescription] =
    useUnsavedDescription(collectionYMap)

  const getSetAuth = () => {
    collectionYMap.set('auth', {
      authType: 'none',
    } as Auth)

    return collectionYMap.get('auth')
  }

  const [unsavedAuth, setUnsavedAuth] = useState<Auth>(
    oauth2LoadLocal(collectionYMap.get('auth'), collectionYMap.get('id')) ??
      getSetAuth()
  )
  const [unsavedVariables, setUnsavedVariables] = useState(
    kvLegacyImporter('variables', collectionYMap, 'localvalue')
  )

  const {
    unsavedExecutionScripts,
    setUnsavedExecutionScripts,
    defaultExecutionScript,
  } = useUnsavedExecutionScripts(collectionYMap, true)

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // If doesn't need save, update fields automatically
  useEffect(() => {
    if (needSave) {
      return
    }

    const newAuth = oauth2LoadLocal(
      collectionYMap.get('auth'),
      collectionYMap.get('id')
    )

    // This is necessary to prevent a feedback loop
    if (hash(unsavedAuth) !== hash(newAuth)) {
      setUnsavedAuth(JSON.parse(JSON.stringify(newAuth)))
    }

    const newVariables = kvLegacyImporter(
      'variables',
      collectionYMap,
      'localvalue'
    )

    // This is necessary to prevent a feedback loop
    if (hash(newVariables) !== hash(unsavedVariables)) {
      setUnsavedVariables(newVariables)
    }

    setUnsavedDescription(getDescription(collectionYMap))

    const newExecutionScripts = getExecutionScripts(collectionYMap, true)

    // This is necessary to prevent a feedback loop
    if (hash(unsavedExecutionScripts) !== hash(newExecutionScripts)) {
      setUnsavedExecutionScripts(newExecutionScripts)
    }

    // This seems to be required to trigger re-render
    setNeedSave(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionHook])

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
    collectionYMap.set(
      'auth',
      guardOAuth2Save(unsavedAuth, collectionYMap.get('id'))
    )
    collectionYMap.set(
      'variables',
      kvExporter(
        unsavedVariables,
        'localvalue',
        collectionYMap.doc?.guid as string
      )
    )
    collectionYMap.set('description', unsavedDescription)
    collectionYMap.set('updatedAt', new Date().toISOString())

    collectionYMap.set(
      'executionScripts',
      unsavedExecutionScripts.filter((s) => !s.builtIn)
    )

    setNeedSave(false)
  }

  const handleSend = async (executionScript: ExecutionScript) => {
    if (!scopeId) throw new Error('No scopeId')
    if (!rawBearer) throw new Error('No rawBearer')

    throw new Error('Not implemented')
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

  return (
    <>
      <PanelLayout
        tabNames={['Variables', 'Auth', 'Scripts', 'Description']}
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
                <CollectionEditorIcon />
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
                    {collectionYMap.get('name')}
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
            <SaveButton needSave={needSave} onSave={handleSave} />
          </Stack>
        }
      >
        {activeTabIndex === 0 && (
          <KeyValueEditor
            items={unsavedVariables}
            setItems={(newItems) =>
              handleFieldUpdate<KeyValueItem[]>(setUnsavedVariables, newItems)
            }
            namespace={`collection-${collectionYMap.get('id')}}-variables`}
            setActionArea={setActionArea}
            enableEnvironmentVariables={false}
            variant="localvalue"
            disableBulkEdit
          />
        )}
        {activeTabIndex === 1 && (
          <AuthPanel
            auth={unsavedAuth}
            setAuth={(newAuth) =>
              handleFieldUpdate<Auth>(setUnsavedAuth, newAuth)
            }
            namespace={`collection-${collectionYMap.get('id')}}-auth`}
            setActionArea={setActionArea}
            disableInherit
            activeId={collectionYMap.get('id')}
          />
        )}
        {activeTabIndex === 2 && (
          <ScriptsPanel
            executionScripts={unsavedExecutionScripts}
            setExecutionScripts={(newScripts) =>
              handleFieldUpdate<ExecutionScript[]>(
                setUnsavedExecutionScripts,
                newScripts
              )
            }
            namespace={`collection:${collectionYMap.get('id')}:scripts`}
            setActionArea={setActionArea}
            onExecute={handleSend}
          />
        )}
        {activeTabIndex === 3 && (
          <DescriptionPanel
            description={unsavedDescription}
            setDescription={(newDescription) =>
              handleFieldUpdate<string>(setUnsavedDescription, newDescription)
            }
            setActionArea={setActionArea}
          />
        )}
      </PanelLayout>
    </>
  )
}
