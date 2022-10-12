/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

import { kvLegacyImporter, LocalValueKV, RESTAuth } from '@apiteam/types/src'
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
import { useYMap } from 'src/lib/zustand-yjs'

import { DescriptionPanel } from '../DescriptionPanel'
import { PanelLayout } from '../PanelLayout'
import { AuthPanel } from '../RESTInputPanel/AuthPanel'
import { SaveButton } from '../RESTInputPanel/SaveButton'

type CollectionInputPanelProps = {
  collectionYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean) => void
}

export const CollectionInputPanel = ({
  collectionYMap,
  setObservedNeedsSave,
}: CollectionInputPanelProps) => {
  useYMap(collectionYMap)

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
    kvLegacyImporter('variables', collectionYMap, 'localvalue')
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    if (!needSave) {
      const needsSave =
        JSON.stringify(unsavedDescription) !==
          JSON.stringify(collectionYMap.get('description')) ||
        JSON.stringify(unsavedAuth) !==
          JSON.stringify(collectionYMap.get('auth')) ||
        JSON.stringify(unsavedVariables) !==
          JSON.stringify(collectionYMap.get('variables'))

      if (needsSave) {
        setNeedSave(true)
        setObservedNeedsSave(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    needSave,
    collectionYMap,
    unsavedDescription,
    unsavedAuth,
    unsavedVariables,
  ])

  const handleSave = () => {
    collectionYMap.set('auth', unsavedAuth)
    collectionYMap.set('variables', unsavedVariables)
    collectionYMap.set('description', unsavedDescription)
    setNeedSave(false)
    setObservedNeedsSave(false)
  }

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
