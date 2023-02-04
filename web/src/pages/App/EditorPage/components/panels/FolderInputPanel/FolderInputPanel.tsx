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

import { useYMap } from 'src/lib/zustand-yjs'
import {
  oauth2LoadLocal,
  guardOAuth2Save,
} from 'src/utils/oauth2/oauth2-guards'

import { DescriptionPanel } from '../../sub-panels/DescriptionPanel'
import { duplicateRecursive } from '../../LeftAside/CollectionTree/Node/utils'
import { PanelLayout } from '../../PanelLayout'
import { AuthPanel } from '../../sub-panels/AuthPanel'
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
  const foldersYMap = collectionYMap.get('folders')
  const restRequestsYMap = collectionYMap.get('restRequests')

  const folderYMap = foldersYMap.get(folderId)
  const folderHook = useYMap(folderYMap)

  const getSetDescription = () => {
    folderYMap.set('description', '')
    return folderYMap.get('description')
  }

  const [unsavedDescription, setUnsavedDescription] = useState<string>(
    folderYMap.get('description') ?? getSetDescription()
  )

  const getSetAuth = () => {
    folderYMap.set('auth', {
      authType: 'inherit',
    })

    return folderYMap.get('auth')
  }

  const [unsavedAuth, setUnsavedAuth] = useState<RESTAuth>(
    oauth2LoadLocal(folderYMap.get('auth'), folderId) ?? getSetAuth()
  )

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
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
      setUnsavedDescription(
        folderYMap.get('description') ?? getSetDescription()
      )
      setUnsavedAuth(
        oauth2LoadLocal(folderYMap.get('auth'), folderId) ?? getSetAuth()
      )

      // This seems to be required to trigger re-render
      handleSetNeedSave(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderHook])

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
    folderYMap.set('description', unsavedDescription)
    folderYMap.set('auth', guardOAuth2Save(unsavedAuth, folderId))
    folderYMap.set('updatedAt', new Date().toISOString())
    handleSetNeedSave(false)
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
            setAuth={(newValue) =>
              handleFieldUpdate<RESTAuth>(setUnsavedAuth, newValue)
            }
            namespace={`folders.${folderId}.auth`}
            setActionArea={setActionArea}
            activeId={folderId}
          />
        )}
        {activeTabIndex === 1 && (
          <DescriptionPanel
            description={unsavedDescription}
            setDescription={(newValue) =>
              handleFieldUpdate<string>(setUnsavedDescription, newValue)
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
