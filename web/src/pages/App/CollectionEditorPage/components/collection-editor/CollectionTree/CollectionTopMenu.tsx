import { useRef, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  Stack,
  Tooltip,
  Popover,
  MenuItem,
  ListItemText,
} from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives'

import { RenameDialog } from '../../../../../../components/app/dialogs/RenameDialog'
import { EnvironmentManager } from '../../../../../../components/app/EnvironmentManager'
type CollectionTopMenuProps = {
  collectionYMap: Y.Map<any>
}

export const CollectionTopMenu = ({
  collectionYMap,
}: CollectionTopMenuProps) => {
  const theme = useTheme()
  const branchYMap = collectionYMap?.parent?.parent
  const projectYMap = branchYMap?.parent?.parent
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const [showEnvironmentManager, setShowEnvironmentManager] = useState(false)
  const [showSettingsPopover, setShowSettingsPopover] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const focusedElementDict = useReactiveVar(focusedElementVar)

  const [titleHovered, setTitleHovered] = useState(false)

  const collection = useYMap(collectionYMap)

  const isActiveEnvironment = activeEnvironmentYMap?.get('id') ? true : false

  if (!projectYMap) {
    throw `Could not find project with id ${projectYMap?.get(
      'id'
    )} for collectionYMap ${collectionYMap?.get('id')}`
  }

  const handleRename = (newName: string) => {
    collectionYMap.set('name', newName)
    collectionYMap.set('updatedAt', new Date().toISOString())
  }

  return (
    <>
      <RenameDialog
        show={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onRename={handleRename}
        original={collection.get('name')}
        title="Rename Collection"
      />
      <Popover
        open={showSettingsPopover}
        onClose={() => setShowSettingsPopover(false)}
        sx={{
          mt: 1,
        }}
        anchorEl={settingsButtonRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem
          onClick={() => {
            setShowSettingsPopover(false)
            setShowRenameDialog(true)
          }}
        >
          <ListItemText primary="Rename" />
        </MenuItem>
      </Popover>
      <EnvironmentManager
        show={showEnvironmentManager}
        setShowCallback={setShowEnvironmentManager}
      />
      <MenuItem
        onClick={() => updateFocusedElement(focusedElementDict, collectionYMap)}
        sx={{
          maxWidth: '100%',
          textTransform: 'none',
          my: 1,
        }}
        disableRipple
        selected={
          focusedElementDict[getFocusedElementKey(collectionYMap)]?.get(
            'id'
          ) === collectionYMap.get('id')
        }
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            width: '100%',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              userSelect: 'none',
            }}
            color={theme.palette.text.primary}
          >
            {collection.data.name}
          </Typography>
          <IconButton
            ref={settingsButtonRef}
            aria-label="Collection Settings"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setShowSettingsPopover(true)
            }}
            sx={{
              marginRight: -1,
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Stack>
      </MenuItem>
      <Stack sx={{ padding: 2, pt: 0 }} spacing={2}>
        <Box>
          <Typography
            variant="body2"
            color={theme.palette.text.secondary}
            sx={{
              userSelect: 'none',
            }}
            gutterBottom
          >
            Environment:
          </Typography>
          <Tooltip title="Switch Environment">
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => setShowEnvironmentManager(true)}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                marginTop: 1,
                maxWidth: '100%',
              }}
              fullWidth
            >
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isActiveEnvironment
                  ? (activeEnvironmentYMap.get('name') as string)
                  : 'None'}
              </span>
            </Button>
          </Tooltip>
        </Box>
      </Stack>
    </>
  )
}
