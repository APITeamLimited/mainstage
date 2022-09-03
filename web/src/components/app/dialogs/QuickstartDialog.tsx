import { makeVar, useReactiveVar } from '@apollo/client'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import ListAltIcon from '@mui/icons-material/ListAlt'
import {
  Dialog,
  DialogTitle,
  Avatar,
  Grid,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  SvgIcon,
  Typography,
} from '@mui/material'
import { Branch, Project } from '@apiteam/types'

import { createCollectionDialogStateVar } from './CreateCollectionDialog'
import { createEnvironmentDialogStateVar } from './CreateEnvironmentDialog'

type QuickstartDialogState = {
  isOpen: boolean
  project: Project | null
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
    createCollectionDialogStateVar({ isOpen: true, project })
  }

  const callNewEnvironmentDialog = () => {
    handleClose()
    createEnvironmentDialogStateVar({ isOpen: true, project })
  }

  const items = [
    {
      primary: 'New Collection',
      secondary: 'Allows quick testing of API requests',
      icon: FeaturedPlayListIcon,
      onClick: callNewCollectionDialog,
    },
    {
      primary: 'New Environment',
      secondary:
        'Store frequently used variables for use in requests and tests',
      icon: ListAltIcon,
      onClick: callNewEnvironmentDialog,
    },
  ]

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg">
      <DialogTitle>Quickstart</DialogTitle>
      <Grid container>
        {items.map(({ primary, secondary, icon, onClick }, index) => (
          <Grid item sm={6} key={index}>
            <MenuItem
              onClick={onClick}
              sx={{
                height: '96px',
                overflow: 'hidden',
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <SvgIcon component={icon} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={primary}
                secondary={secondary}
                sx={{
                  overflow: 'hidden',
                }}
                secondaryTypographyProps={{ style: { whiteSpace: 'normal' } }}
              />
            </MenuItem>
          </Grid>
        ))}
      </Grid>
    </Dialog>
  )
}
