/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'

import {
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

  const getSetAuth = () => {
    collectionYMap.set('auth', {
      authType: 'none',
    } as RESTAuth)

    return collectionYMap.get('auth')
  }

  const getSetDescription = () => {
    collectionYMap.set('description', '')
    return collectionYMap.get('description')
  }

  const [unsavedDescription, setUnsavedDescription] = useState<string>(
    collectionYMap.get('description') ?? getSetDescription()
  )
  const [unsavedAuth, setUnsavedAuth] = useState<RESTAuth>(
    collectionYMap.get('auth') ?? getSetAuth()
  )
  const [unsavedVariables, setUnsavedVariables] = useState(
    kvLegacyImporter<LocalValueKV>('variables', collectionYMap, 'localvalue')
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // If doesn't need save, update fields automatically
  /*useEffect(() => {
    if (!needSave) {
      setUnsavedDescription(collectionYMap.get('description') ?? '')
      setUnsavedAuth(collectionYMap.get('auth') ?? getSetAuth())
      setUnsavedVariables(
        kvLegacyImporter<LocalValueKV>(
          'variables',
          collectionYMap,
          'localvalue'
        )
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionHook])*/

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
    setNeedSave(false)
    setObservedNeedsSave(false)
  }

  const saveCallbackRef = useRef<() => void>(handleSave)
  saveCallbackRef.current = handleSave

  const [mountTime] = useState(Date.now())

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    if (!needSave && Date.now() - mountTime > 400) {
      const needsSave =
        hash(unsavedDescription) !== hash(collectionYMap.get('description')) ||
        hash(unsavedAuth) !== hash(collectionYMap.get('auth'))

      if (needsSave) {
        setNeedSave(true)
        setObservedNeedsSave(true, () => saveCallbackRef.current())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps, prettier/prettier
  }, [
    needSave,
    collectionHook,
    unsavedDescription,
    unsavedAuth,
  ])

  useEffect(() => {
    if (!needSave && Date.now() - mountTime > 400) {
      setNeedSave(true)
      setObservedNeedsSave(true, () => saveCallbackRef.current())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedVariables])

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
            setItems={setUnsavedVariables}
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
            setAuth={setUnsavedAuth}
            namespace={collectionYMap.get('id')}
            setActionArea={setActionArea}
            disableInherit
          />
        )}
        {activeTabIndex === 2 && (
          <DescriptionPanel
            description={unsavedDescription}
            setDescription={setUnsavedDescription}
            setActionArea={setActionArea}
          />
        )}
      </PanelLayout>
    </>
  )
}
