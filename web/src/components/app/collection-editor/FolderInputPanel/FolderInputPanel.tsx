import { useEffect, useState } from 'react'

import { RESTAuth } from '@apiteam/types'
import FolderIcon from '@mui/icons-material/Folder'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { v4 as uuid } from 'uuid'

import { duplicateRecursive } from '../CollectionTree/Node/utils'
import { DescriptionPanel } from '../DescriptionPanel'
import { PanelLayout } from '../PanelLayout'
import { AuthPanel } from '../RESTInputPanel/AuthPanel'
import { SaveButton } from '../RESTInputPanel/SaveButton'

import { SaveAsDialog } from './SaveAsDialog'

type FolderInputPanelProps = {
  folderId: string
  collectionYMap: Y.Map<any>
}

export const FolderInputPanel = ({
  folderId,
  collectionYMap,
}: FolderInputPanelProps) => {
  const foldersYMap = collectionYMap.get('folders')
  const restRequestsYMap = collectionYMap.get('restRequests')
  const folderYMap = foldersYMap.get(folderId)

  const getSetAuth = () => {
    folderYMap.set('auth', {
      authType: 'inherit',
    })

    return folderYMap.get('auth')
  }

  const [unsavedDescription, setUnsavedDescription] = useState<string>(
    folderYMap.get('description') || ''
  )
  const [unsavedAuth, setUnsavedAuth] = useState<RESTAuth>(
    folderYMap.get('auth') ?? getSetAuth()
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    if (!needSave) {
      setNeedSave(
        JSON.stringify(unsavedDescription) !==
          JSON.stringify(folderYMap.get('description')) ||
          JSON.stringify(unsavedAuth) !== JSON.stringify(folderYMap.get('auth'))
      )
    }
  }, [needSave, folderYMap, unsavedDescription, unsavedAuth])

  const handleSave = () => {
    folderYMap.set('description', unsavedDescription)
    folderYMap.set('auth', unsavedAuth)
    setNeedSave(false)
  }

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
    newFolder.set('auth', unsavedAuth)
    newFolder.set('description', unsavedDescription)
  }

  return (
    <>
      <PanelLayout
        tabNames={['Auth', 'Description']}
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
            setAuth={setUnsavedAuth}
            namespace={folderYMap.get('id')}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 1 && (
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
