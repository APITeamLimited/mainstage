import { useEffect, useState } from 'react'

import { RESTAuth } from '@apiteam/types'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'

import { DescriptionPanel } from '../DescriptionPanel'
import { KeyValueEditor } from '../KeyValueEditor'
import { PanelLayout } from '../PanelLayout'
import { AuthPanel } from '../RESTInputPanel/AuthPanel'
import { SaveButton } from '../RESTInputPanel/SaveButton'

type CollectionInputPanelProps = {
  collectionYMap: Y.Map<any>
}

export const CollectionInputPanel = ({
  collectionYMap,
}: CollectionInputPanelProps) => {
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

  const getSetVariables = () => {
    collectionYMap.set('variables', [])
    return collectionYMap.get('variables')
  }

  const [unsavedDescription, setUnsavedDescription] = useState<string>(
    collectionYMap.get('description') ?? getSetDescription()
  )
  const [unsavedAuth, setUnsavedAuth] = useState<RESTAuth>(
    collectionYMap.get('auth') ?? getSetAuth()
  )
  const [unsavedVariables, setUnsavedVariables] = useState(
    collectionYMap.get('variables') ?? getSetVariables()
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    if (!needSave) {
      setNeedSave(
        JSON.stringify(unsavedDescription) !==
          JSON.stringify(collectionYMap.get('description')) ||
          JSON.stringify(unsavedAuth) !==
            JSON.stringify(collectionYMap.get('auth')) ||
          JSON.stringify(unsavedVariables) !==
            JSON.stringify(collectionYMap.get('variables'))
      )
    }
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
          <KeyValueEditor
            items={unsavedVariables}
            setItems={setUnsavedVariables}
            namespace={`${collectionYMap.get('id')}}-variables`}
            setActionArea={setActionArea}
            enableEnvironmentVariables={false}
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
