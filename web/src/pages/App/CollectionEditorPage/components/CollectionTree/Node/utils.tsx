/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteIcon from '@mui/icons-material/Delete'
import ErrorIcon from '@mui/icons-material/Error'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import {
  Box,
  CircularProgress,
  Icon,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { GlobeTestIcon } from 'src/components/utils/Icons'

export const getNewOrderingIndex = ({
  folderYMaps,
  restRequestYMaps,
}: {
  folderYMaps: YMap<any>[]
  restRequestYMaps: YMap<any>[]
}) =>
  Math.max(
    -1, // We want the first element to be at index 0
    ...folderYMaps.map((folder) => folder.get('orderingIndex')),
    ...restRequestYMaps.map((request) => request.get('orderingIndex'))
  ) + 1

export const getNodeIcon = (nodeYMap: YMap<any>, collapsed: boolean) => {
  if (nodeYMap?.get('__typename') === undefined) {
    return <DeleteIcon sx={{ color: 'error.main' }} />
  } else if (nodeYMap.get('__typename') === 'Collection') {
    return <FeaturedPlayListIcon />
  } else if (nodeYMap.get('__typename') === 'Folder' && collapsed) {
    return <FolderIcon />
  } else if (nodeYMap.get('__typename') === 'Folder' && !collapsed) {
    return <FolderOpenIcon />
  } else if (
    nodeYMap.get('__typename') === 'RESTRequest' ||
    nodeYMap.get('__typename') === 'RESTResponse'
  ) {
    return (
      <Icon sx={{ overflow: 'visible' }}>
        <Stack
          sx={{
            width: '24px',
            maxWidth: '24px',
            height: '24px',
            maxHeight: '24px',
            overflow: 'hidden',
          }}
          justifyContent="center"
          alignItems="center"
        >
          {nodeYMap.get('__subtype') === 'LoadingResponse' ? (
            <CircularProgress size={20} />
          ) : nodeYMap.get('__subtype') === 'FailureResult' ? (
            <ErrorIcon sx={{ color: 'error.main' }} />
          ) : nodeYMap.get('__subtype') === 'SuccessMultipleResult' ? (
            <GlobeTestIcon sx={{ color: 'primary.light' }} />
          ) : (
            <>
              <Typography
                fontSize={nodeYMap.get('method').length > 4 ? 6 : 8}
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  maxWidth: '24px',
                }}
              >
                {nodeYMap.get('method')?.toUpperCase()}
              </Typography>
              <Typography fontSize={8}>REST</Typography>
            </>
          )}
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
        height: '0.25rem',
        backgroundColor: theme.palette.primary.light,
        // Prevent drop space from taking up space
        marginY: '-0.125rem',
        position: 'relative',
        overflow: 'visible',
        zIndex: 1,
      }}
    />
  )
}

type DeleteRecursiveArgs = {
  nodeYMap: YMap<any>
  foldersYMap: YMap<any>
  restRequestsYMap: YMap<any>
  restResponsesYMap: YMap<any>
}

export const deleteRecursive = ({
  nodeYMap,
  foldersYMap,
  restRequestsYMap,
  restResponsesYMap,
}: DeleteRecursiveArgs) => {
  const nodeId = nodeYMap.get('id')
  if (nodeYMap.get('__typename') === 'Folder') {
    foldersYMap.delete(nodeId)

    Array.from(foldersYMap.values())?.forEach((folder) => {
      if (folder.get('parentId') === nodeId) {
        deleteRecursive({
          nodeYMap: folder,
          foldersYMap,
          restRequestsYMap,
          restResponsesYMap,
        })
      }
    })

    Array.from(restRequestsYMap.values())?.forEach((restRequest) => {
      if (restRequest.get('parentId') === nodeId) {
        deleteRecursive({
          nodeYMap: restRequest,
          foldersYMap,
          restRequestsYMap,
          restResponsesYMap,
        })
      }
    })
  } else if (nodeYMap.get('__typename') === 'RESTRequest') {
    restRequestsYMap.delete(nodeYMap.get('id'))

    Array.from(restResponsesYMap.values())?.forEach((restResponse) => {
      if (restResponse.get('parentId') === nodeId) {
        deleteRecursive({
          nodeYMap: restResponse,
          foldersYMap,
          restRequestsYMap,
          restResponsesYMap,
        })
      }
    })
  } else if (nodeYMap.get('__typename') === 'RESTResponse') {
    restResponsesYMap.delete(nodeId)
  } else {
    console.warn(
      `deleteRecursive: Unknown item type: ${nodeYMap.get('__typename')}`
    )
  }
}

type DuplicateRecursiveArgs = {
  nodeYMap: YMap<any>
  newParentId?: string | null
  foldersYMap: YMap<any>
  restRequestsYMap: YMap<any>
  newId?: string
}

export const duplicateRecursive = ({
  nodeYMap,
  foldersYMap,
  restRequestsYMap,
  newParentId = null,
  newId = uuid(),
}: DuplicateRecursiveArgs) => {
  // Works in the opposite way of deleteRecursive i.e. duplicateRecursive starts
  // at the top and works down, passing the new parent as a nodeYMap

  if (nodeYMap.get('__typename') === 'Folder') {
    // Create duplicate folder
    const newFolder = nodeYMap.clone()
    newFolder.set('id', newId)
    newFolder.set('createdAt', new Date().toISOString())
    newFolder.set('updatedAt', null)

    newFolder.set('name', `${nodeYMap.get('name')} (copy)`)

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
