import { useReactiveVar } from '@apollo/client'
import FolderIcon from '@mui/icons-material/Folder'
import {
  useTheme,
  Popover,
  Stack,
  MenuItem,
  ListItemText,
  Typography,
  ListItemAvatar,
  ListItemIcon,
  ListItem,
} from '@mui/material'

import {
  activeWorkspaceVar,
  generateLocalFolder,
  LocalCollection,
  localFoldersVar,
  localRESTRequestsVar,
} from 'src/contexts/reactives'

type NewItemPopoverProps = {
  open?: boolean
  collection: LocalCollection
  anchorEl: null | Element
  onClose?: () => void
}

export const NewItemPopover = ({
  open,
  collection,
  anchorEl,
  onClose,
}: NewItemPopoverProps) => {
  const localFolders = useReactiveVar(localFoldersVar)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)
  const isLocalWorkspace = activeWorkspace.__typename === 'Anonymous'

  const handleCreateNewFolder = () => {
    if (isLocalWorkspace) {
      // Create new folder with parent of the collection
      localFoldersVar(
        localFolders.concat(
          generateLocalFolder({
            parentId: collection.id,
            __parentTypename: 'LocalCollection',
            name: new Date().toISOString(),
          })
        )
      )
    } else {
      throw 'NewItemPopover non-local workspace not implemented'
    }
    onClose()
  }

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      keepMounted
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
          onClick={() => undefined}
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
