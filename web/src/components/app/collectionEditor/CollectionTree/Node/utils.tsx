import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { Box, Icon, Stack, Typography, useTheme } from '@mui/material'

import { LocalFolder, LocalRESTRequest } from 'src/contexts/reactives'

import { NodeItem } from '.'

export const getNodeIcon = (item: NodeItem, collapsed: boolean) => {
  if (['LocalFolder', 'RemoteFolder'].includes(item.__typename) && collapsed) {
    return <FolderIcon />
  } else if (
    ['LocalFolder', 'RemoteFolder'].includes(item.__typename) &&
    !collapsed
  ) {
    return <FolderOpenIcon />
  } else if (item.__typename === 'LocalRESTRequest') {
    return (
      <Icon>
        <Stack>
          <Typography fontSize={8}>{item.method}</Typography>
          <Typography fontSize={8}>REST</Typography>
        </Stack>
      </Icon>
    )
  }
  throw `getNodeIcon: Unknown item type: ${item.__typename}`
}

export const DropSpaceTop = () => {
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

export const DropSpaceBottom = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        height: '0.5rem',
        marginBottom: -0.5,
        backgroundColor: theme.palette.primary.light,
      }}
    />
  )
}

type DeleteRecursiveArgs = {
  item: NodeItem
  localFolders: LocalFolder[]
  localRESTRequests: LocalRESTRequest[]
}

type DeleteRecursiveResult = {
  localFolders: LocalFolder[]
  localRESTRequests: LocalRESTRequest[]
}

export const deleteRecursive = ({
  item,
  localFolders,
  localRESTRequests,
}: DeleteRecursiveArgs): DeleteRecursiveResult => {
  if (item.__typename === 'LocalFolder') {
    const index = localFolders.findIndex((folder) => folder.id === item.id)

    if (index === -1) {
      throw `deleteRecursive: LocalFolder not found: ${item.id}`
    }
    // Set newLocalFolders, removing the folder at index
    localFolders.splice(index, 1)

    const filteredLocalRESTRequests = localRESTRequests.filter(
      (request) => request.parentId === item.id
    )

    // Recurse on children
    const nestedLocalFolders = localFolders.filter(
      (folder) => folder.parentId === item.id
    )

    return nestedLocalFolders.reduce(
      (acc, folder) =>
        deleteRecursive({
          item: folder,
          localFolders: acc.localFolders,
          localRESTRequests: acc.localRESTRequests,
        }),
      {
        localFolders: nestedLocalFolders,
        localRESTRequests: filteredLocalRESTRequests,
      }
    )
  } else if (item.__typename === 'LocalRESTRequest') {
    const index = localRESTRequests.findIndex(
      (request) => request.id === item.id
    )
    if (index === -1) {
      throw `deleteRecursive: LocalRESTRequest not found: ${item.id}`
    }
    localRESTRequests.splice(index, 1)
    return { localFolders, localRESTRequests }
  } else {
    throw `deleteRecursive: Unknown item type: ${item.__typename}`
  }
}
