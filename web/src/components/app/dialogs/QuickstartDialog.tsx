import { Project } from '@apiteam/types/src'
import { makeVar, useReactiveVar } from '@apollo/client'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import ImportExportIcon from '@mui/icons-material/ImportExport'
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
} from '@mui/material'

import { createCollectionDialogStateVar } from './CreateCollectionDialog'
import { createEnvironmentDialogStateVar } from './CreateEnvironmentDialog'
import { importDialogStateVar } from './ImportDialog'

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

  const items = [
    {
      primary: 'New Collection',
      secondary: 'Allows quick testing of API requests',
      icon: FeaturedPlayListIcon,
      onClick: () => {
        handleClose()
        createCollectionDialogStateVar({ isOpen: true, project })
      },
    },
    {
      primary: 'New Environment',
      secondary:
        'Store frequently used variables for use in requests and tests',
      icon: ListAltIcon,
      onClick: () => {
        handleClose()
        createEnvironmentDialogStateVar({ isOpen: true, project })
      },
    },
    {
      primary: 'Import',
      secondary:
        'Quickly get started with an existing API, Collection, or something else',
      icon: ImportExportIcon,
      onClick: () => {
        handleClose()
        importDialogStateVar({ isOpen: true, project })
      },
    },
  ]

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md">
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
                secondaryTypographyProps={{ sx: { whiteSpace: 'normal' } }}
              />
            </MenuItem>
          </Grid>
        ))}
      </Grid>
    </Dialog>
  )
}
