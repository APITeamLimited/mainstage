import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { Box, Icon, Stack, Typography, useTheme } from '@mui/material'
import { v4 as uuid } from 'uuid'

import * as Y from 'yjs'

export const getNewOrderingIndex = ({
  folderYMaps,
  restRequestYMaps,
}: {
  folderYMaps: Y.Map<any>[]
  restRequestYMaps: Y.Map<any>[]
}) =>
  Math.max(
    -1, // We want the first element to be at index 0
    ...folderYMaps.map((folder) => folder.get('orderingIndex')),
    ...restRequestYMaps.map((request) => request.get('orderingIndex'))
  ) + 1

export const getNodeIcon = (nodeYMap: Y.Map<any>, collapsed: boolean) => {
  if (nodeYMap.get('__typename') === 'Folder' && collapsed) {
    return <FolderIcon />
  } else if (nodeYMap.get('__typename') === 'Folder' && !collapsed) {
    return <FolderOpenIcon />
  } else if (nodeYMap.get('__typename') === 'RESTRequest') {
    return (
      <Icon>
        <Stack>
          <Typography fontSize={8}>
            {nodeYMap.get('method')?.toUpperCase()}
          </Typography>
          <Typography fontSize={8}>REST</Typography>
        </Stack>
      </Icon>
    )
  }
  throw `getNodeIcon: Unknown item type: ${nodeYMap.get('__typename')}`
}

export const DropSpace = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        height: '0.5rem',
        backgroundColor: theme.palette.primary.light,
        marginBottom: -1,
      }}
    />
  )
}

type DeleteRecursiveArgs = {
  nodeYMap: Y.Map<any>
  foldersYMap: Y.Map<any>
  restRequestsYMap: Y.Map<any>
}

export const deleteRecursive = ({
  nodeYMap,
  foldersYMap,
  restRequestsYMap,
}: DeleteRecursiveArgs) => {
  if (nodeYMap.get('__typename') === 'Folder') {
    foldersYMap.delete(nodeYMap.get('id'))

    // Loop through restRequests and delete any that are in this folder

    Array.from(foldersYMap.values())?.filter((restRequest) => {
      if (restRequest.get('parentId') === nodeYMap.get('id')) {
        restRequestsYMap.delete(restRequest.get('id'))
      }
    })

    // Recurse on children
    const nestedFolders = Array.from(foldersYMap.values())?.filter(
      (folder) => folder.get('parentId') === nodeYMap.get('id')
    )

    nestedFolders.reduce(
      (acc, folder) =>
        deleteRecursive({
          nodeYMap: folder,
          foldersYMap,
          restRequestsYMap,
        }),
      {
        foldersYMap,
        restRequestsYMap,
      }
    )
  } else if (nodeYMap.get('__typename') === 'RESTRequest') {
    restRequestsYMap.delete(nodeYMap.get('id'))
  } else {
    throw `deleteRecursive: Unknown item type: ${nodeYMap.get('__typename')}`
  }
}

type DuplicateRecursiveArgs = {
  nodeYMap: Y.Map<any>
  newParentId?: string | null
  foldersYMap: Y.Map<any>
  restRequestsYMap: Y.Map<any>
}

export const duplicateRecursive = ({
  nodeYMap,
  foldersYMap,
  restRequestsYMap,
  newParentId = null,
}: DuplicateRecursiveArgs) => {
  // Works in the opposite way of deleteRecursive i.e. duplicateRecursive starts
  // at the top and works down, passing the new parent as nodeYMap

  if (nodeYMap.get('__typename') === 'Folder') {
    // Create duplicate folder
    const newFolder = nodeYMap.clone()
    const newId = uuid()
    newFolder.set('id', newId)
    newFolder.set('createdAt', new Date().toISOString())
    newFolder.set('updatedAt', null)

    if (newParentId === null) {
      newFolder.set('parentId', nodeYMap.get('parentId'))

      // Add new folder just below the original folder
      const oldOrderingIndex = nodeYMap.get('orderingIndex')
      newFolder.set('orderingIndex', oldOrderingIndex + 0.5)
    } else {
      newFolder.set('parentId', newParentId)
    }

    // Collect folders and restRequests in this folder
    const nestedFolders = Array.from(foldersYMap.values())?.filter(
      (folder) => folder.get('parentId') === nodeYMap.get('id')
    )

    const nestedRestRequests = Array.from(restRequestsYMap.values())?.filter(
      (request) => request.get('parentId') === nodeYMap.get('id')
    )

    foldersYMap.set(newId, newFolder)

    // Recurse on children
    nestedFolders.forEach((folder) =>
      duplicateRecursive({
        nodeYMap: folder,
        foldersYMap,
        restRequestsYMap,
        newParentId: newId,
      })
    )

    nestedRestRequests.forEach((request) =>
      duplicateRecursive({
        nodeYMap: request,
        foldersYMap,
        restRequestsYMap,
        newParentId: newId,
      })
    )
  } else if (nodeYMap.get('__typename') === 'RESTRequest') {
    // Duplicate request
    const newRequest = nodeYMap.clone()
    const newId = uuid()
    newRequest.set('id', newId)

    if (newParentId === null) {
      newRequest.set('name', `${nodeYMap.get('name')} (copy)`)
      newRequest.set('parentId', nodeYMap.get('parentId'))

      // Add new request just below the original
      const oldOrderingIndex = nodeYMap.get('orderingIndex')
      newRequest.set('orderingIndex', oldOrderingIndex + 0.5)
    } else {
      newRequest.set('parentId', newParentId)
    }

    newRequest.set('createdAt', new Date().toISOString())
    newRequest.set('updatedAt', null)

    restRequestsYMap.set(newId, newRequest)
  } else {
    throw `duplicateRecursive: Unknown item type: ${nodeYMap.get('__typename')}`
  }
}
