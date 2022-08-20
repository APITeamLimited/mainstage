import FolderIcon from '@mui/icons-material/Folder'
import {
  Popover,
  Stack,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import * as Y from 'yjs'

import {
  createFolder,
  createRestRequest,
} from '../../../../../../entity-engine/src/entities'

import { getNewOrderingIndex } from './Node/utils'

type NewItemPopoverProps = {
  open?: boolean
  collectionYMap: Y.Map<any>
  anchorEl: null | Element
  onClose?: () => void
}

export const NewItemPopover = ({
  open,
  collectionYMap,
  anchorEl,
  onClose,
}: NewItemPopoverProps) => {
  const foldersYMap = collectionYMap.get('folders')
  const restRequestsYMap = collectionYMap.get('restRequests')

  const handleCreateNewFolder = () => {
    const folderYMapsThisLevel = Array.from(foldersYMap.values()).filter(
      (folderYMap) => folderYMap.get('parentId') === collectionYMap.get('id')
    ) as Y.Map<any>[]

    const restRequestYMapsThisLevel = Array.from(
      restRequestsYMap.values()
    ).filter(
      (restRequestYMap) =>
        restRequestYMap.get('parentId') === collectionYMap.get('id')
    ) as Y.Map<any>[]

    const { folder, id } = createFolder({
      parentId: collectionYMap.get('id'),
      __parentTypename: 'Collection',
      orderingIndex: getNewOrderingIndex({
        folderYMaps: folderYMapsThisLevel,
        restRequestYMaps: restRequestYMapsThisLevel,
      }),
    })

    foldersYMap.set(id, folder)
    onClose?.()
  }

  const handleCreateNewRESTRequest = () => {
    const folderYMapsThisLevel = Array.from(foldersYMap.values()).filter(
      (folderYMap) => folderYMap.get('parentId') === collectionYMap.get('id')
    ) as Y.Map<any>[]

    const restRequestYMapsThisLevel = Array.from(
      restRequestsYMap.values()
    ).filter(
      (restRequestYMap) =>
        restRequestYMap.get('parentId') === collectionYMap.get('id')
    ) as Y.Map<any>[]

    const { request, id } = createRestRequest({
      parentId: collectionYMap.get('id'),
      __parentTypename: 'Collection',
      orderingIndex: getNewOrderingIndex({
        folderYMaps: folderYMapsThisLevel,
        restRequestYMaps: restRequestYMapsThisLevel,
      }),
    })

    restRequestsYMap.set(id, request)
    onClose?.()
  }

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      onClose={onClose}
      open={!!open}
      sx={{
        mt: 1,
      }}
    >
      <Stack>
        <MenuItem
          onClick={handleCreateNewFolder}
          sx={{
            padding: 2,
          }}
        >
          <ListItemIcon
            sx={{
              marginRight: 2,
            }}
          >
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary="New Folder" />
        </MenuItem>
        <MenuItem
          onClick={handleCreateNewRESTRequest}
          sx={{
            padding: 2,
          }}
        >
          <ListItemIcon
            sx={{
              marginRight: 1,
            }}
          >
            REST
          </ListItemIcon>
          <ListItemText primary="New REST Request" />
        </MenuItem>
      </Stack>
    </Popover>
  )
}
