/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'

import {
  KeyValueItem,
  kvExporter,
  kvLegacyImporter,
  LocalValueKV,
  RESTAuth,
} from '@apiteam/types/src'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import type { Map as YMap } from 'yjs'

import { KeyValueEditor } from 'src/components/app/KeyValueEditor'
import { useHashSumModule } from 'src/contexts/imports'
import { useYMap } from 'src/lib/zustand-yjs'

import { DescriptionPanel } from '../DescriptionPanel'
import { PanelLayout } from '../PanelLayout'
import { AuthPanel } from '../RESTInputPanel/AuthPanel'
import { SaveButton } from '../RESTInputPanel/SaveButton'

type CollectionInputPanelProps = {
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
}

export const CollectionInputPanel = ({
  collectionYMap,
  setObservedNeedsSave,
}: CollectionInputPanelProps) => {
  const { default: hash } = useHashSumModule()

  const collectionHook = useYMap(collectionYMap)

  const getSetDescription = () => {
    collectionYMap.set('description', '')
    return collectionYMap.get('descSription')
  }

  const [unsavedDescription, setUnsavedDescription] = useState<string>(
    collectionYMap.get('description') ?? getSetDescription()
  )

  const getSetAuth = () => {
    collectionYMap.set('auth', {
      authType: 'none',
    } as RESTAuth)

    return collectionYMap.get('auth')
  }

  const [unsavedAuth, setUnsavedAuth] = useState<RESTAuth>(
    collectionYMap.get('auth') ?? getSetAuth()
  )
  const [unsavedVariables, setUnsavedVariables] = useState(
    kvLegacyImporter<LocalValueKV>('variables', collectionYMap, 'localvalue')
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  const handleSetNeedSave = (needSave: boolean) => {
    setNeedSave(needSave)

    if (needSave) {
      setObservedNeedsSave(true, () => saveCallbackRef.current())
    } else {
      setObservedNeedsSave(false)
    }
  }

  // If doesn't need save, update fields automatically
  useEffect(() => {
    if (!needSave) {
      setUnsavedDescription(collectionYMap.get('description') ?? '')
      setUnsavedAuth(collectionYMap.get('auth') ?? getSetAuth())

      const newVariables = kvLegacyImporter<LocalValueKV>(
        'variables',
        collectionYMap,
        'localvalue'
      )

      // This is necessary to prevent a feedback loop
      if (hash(newVariables) !== hash(unsavedVariables)) {
        setUnsavedVariables(newVariables)
      }

      // This seems to be required to trigger re-render
      handleSetNeedSave(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionHook])

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  const handleFieldUpdate = <T extends any>(
    setter: (value: T) => void,
    newValue: T
  ) => {
    if (!needSave) {
      handleSetNeedSave(true)
    }

    // Call the setter after the needSave state is set to true else will try and
    // update fields automatically
    setter(newValue)
  }

  const handleSave = () => {
    collectionYMap.set('auth', unsavedAuth)
    collectionYMap.set(
      'variables',
      kvExporter<LocalValueKV>(
        unsavedVariables,
        'localvalue',
        collectionYMap.doc?.guid as string
      )
    )
    collectionYMap.set('description', unsavedDescription)
    collectionYMap.set('updatedAt', new Date().toISOString())
    handleSetNeedSave(false)
  }

  const saveCallbackRef = useRef<() => void>(handleSave)
  saveCallbackRef.current = handleSave

  return (
    <>
      <PanelLayout
        tabNames={['Variables', 'Auth', 'Description']}
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
                <FeaturedPlayListIcon />
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
            <SaveButton needSave={needSave} onSave={handleSave} />
          </Stack>
        }
      >
        {activeTabIndex === 0 && (
          <KeyValueEditor<LocalValueKV>
            items={unsavedVariables}
            setItems={(newItems) =>
              handleFieldUpdate<KeyValueItem<LocalValueKV>[]>(
                setUnsavedVariables,
                newItems
              )
            }
            namespace={`${collectionYMap.get('id')}}-variables`}
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
              handleFieldUpdate<RESTAuth>(setUnsavedAuth, newAuth)
            }
            namespace={collectionYMap.get('id')}
            setActionArea={setActionArea}
            disableInherit
          />
        )}
        {activeTabIndex === 2 && (
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
