import { makeVar, useReactiveVar } from '@apollo/client'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import {
  Dialog,
  DialogTitle,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material'

import { LocalProject } from 'src/contexts/reactives'

import { createCollectionDialogStateVar } from './CreateCollectionDialog'

type QuickstartDialogState = {
  isOpen: boolean
  project: LocalProject | null
}

const initialQuickstartDialogState: QuickstartDialogState = {
  isOpen: false,
  project: null,
}

export const quickstartDialogStateVar = makeVar(initialQuickstartDialogState)

export function QuickstartDialog() {
  const { isOpen, project } = useReactiveVar(quickstartDialogStateVar)

  const handleClose = () => {
    quickstartDialogStateVar({ isOpen: false, project: null })
  }

  const callNewCollectionDialog = () => {
    handleClose()
    createCollectionDialogStateVar({ isOpen: true, project: project })
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm">
      <DialogTitle>Quickstart</DialogTitle>
      <List>
        <ListItem button onClick={callNewCollectionDialog}>
          <ListItemAvatar>
            <Avatar>
              <FeaturedPlayListIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Create a new collection"
            secondary="Allows quick testing of API requests"
          />
        </ListItem>
      </List>
    </Dialog>
  )
}
