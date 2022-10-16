/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from 'react'

import { RESTAuth } from '@apiteam/types/src'
import FolderIcon from '@mui/icons-material/Folder'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { useHashSumModule } from 'src/contexts/imports'
import { useYMap } from 'src/lib/zustand-yjs'

import { duplicateRecursive } from '../CollectionTree/Node/utils'
import { DescriptionPanel } from '../DescriptionPanel'
import { PanelLayout } from '../PanelLayout'
import { AuthPanel } from '../RESTInputPanel/AuthPanel'
import { SaveButton } from '../RESTInputPanel/SaveButton'

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

  const foldersYMap = collectionYMap.get('folders')
  const restRequestsYMap = collectionYMap.get('restRequests')
  const folderYMap = foldersYMap.get(folderId)
  const folderHook = useYMap(folderYMap)

  const getSetAuth = () => {
    folderYMap.set('auth', {
      authType: 'inherit',
    })

    return folderYMap.get('auth')
  }

  const getSetDescription = () => {
    folderYMap.set('description', '')
    return folderYMap.get('description')
  }

  const [unsavedDescription, setUnsavedDescription] = useState<string>(
    folderYMap.get('description') ?? getSetDescription()
  )
  const [unsavedAuth, setUnsavedAuth] = useState<RESTAuth>(
    folderYMap.get('auth') ?? getSetAuth()
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  // If doesn't need save, update fields automatically
  /*useEffect(() => {
    if (!needSave) {
      setUnsavedDescription(
        folderYMap.get('description') ?? getSetDescription()
      )
      setUnsavedAuth(folderYMap.get('auth') ?? getSetAuth())
      setNeedSave(false)
      setObservedNeedsSave(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderHook])*/

  const handleSave = () => {
    folderYMap.set('description', unsavedDescription)
    folderYMap.set('auth', unsavedAuth)
    folderYMap.set('updatedAt', new Date().toISOString())
    setNeedSave(false)
    setObservedNeedsSave(false)
  }

  const saveCallbackRef = useRef<() => void>(handleSave)
  saveCallbackRef.current = handleSave

  // Update needSave when any of the unsaved fields change
  useEffect(() => {
    if (!needSave) {
      const needsSave =
        hash(unsavedDescription) !== hash(folderYMap.get('description')) ||
        hash(unsavedAuth) !== hash(folderYMap.get('auth'))

      if (needsSave) {
        setNeedSave(true)
        setObservedNeedsSave(true, () => saveCallbackRef.current())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needSave, folderHook, unsavedDescription, unsavedAuth])

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
