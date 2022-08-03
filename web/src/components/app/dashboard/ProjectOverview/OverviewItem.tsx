import { useRef, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Button,
  Paper,
  Typography,
  Box,
  Stack,
  IconButton,
  useTheme,
  Tooltip,
  Popover,
  MenuItem,
  ListItemText,
} from '@mui/material'
import { v4 as uuid } from 'uuid'
import { useYMap } from 'zustand-yjs'

import { routes, navigate } from '@redwoodjs/router'

import { activeWorkspaceIdVar } from 'src/contexts/reactives'

import { QueryDeleteDialog } from '../../dialogs/QueryDeleteDialog'
import { RenameDialog } from '../../dialogs/RenameDialog'

import { OverviewType } from './utils'

type OverviewItemProps = {
  overviewItem: OverviewType['overviewItem']
  yMap: OverviewType['yMap']
}

export function OverviewItem({ overviewItem, yMap }: OverviewItemProps) {
  const theme = useTheme()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const [showActionsPopover, setShowActionsPopover] = useState(false)
  const actionsButtonRef = useRef<HTMLButtonElement>(null)

  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)

  const overview = useYMap(yMap)

  const handleDuplicate = () => {
    const newItem = yMap.clone()
    const newId = uuid()
    newItem.set('id', newId)
    newItem.set('name', `${overviewItem.name} (copy)`)
    newItem.set('createdAt', new Date().toISOString())
    newItem.set('updatedAt', null)
    yMap.parent?.set(newId, newItem)
  }

  const handleRename = (newName: string) => {
    yMap.set('name', newName)
    yMap.set('updatedAt', new Date().toISOString())
  }

  const handleDelete = () => {
    yMap.parent?.delete(overviewItem.id)
  }

  const getTypeName = () => {
    const typename = overviewItem.__typename
    if (typename === 'Collection') {
      return 'Collection'
    } else if (typename === 'Project') {
      return 'Project'
    } else {
      console.log(overviewItem)
      throw `Unknown type: ${typename}`
    }
  }

  const displayType = getTypeName()

  const handleCollectionNavigation = () => {
    // Navigate to the collection editor page
    const branch = yMap.parent?.parent
    if (!branch) throw 'No branch found'
    const project = branch.parent?.parent
    if (!project) throw 'No project found'

    let params = {
      workspaceId: activeWorkspaceId,
      projectId: project.get('id'),
      branchId: branch.get('id'),
    }

    if (displayType === 'Collection') {
      params = {
        ...params,
        collectionId: yMap.get('id'),
      }
    }

    return navigate(routes.collectionEditor(params))
  }

  return (
    <>
      <RenameDialog
        show={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onRename={handleRename}
        original={overviewItem.name}
        title={`Rename ${displayType}`}
      />
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onDelete={handleDelete}
        onClose={() => setShowQueryDeleteDialog(false)}
        title={`Delete ${displayType}`}
        description={`Are you sure you want to delete ${displayType} ${overviewItem.name}?`}
      />
      <Popover
        open={showActionsPopover}
        anchorEl={actionsButtonRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={() => setShowActionsPopover(false)}
        sx={{
          mt: 1,
        }}
      >
        <MenuItem
          onClick={() => {
            setShowActionsPopover(false)
            setShowRenameDialog(true)
          }}
        >
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowActionsPopover(false)
            setShowQueryDeleteDialog(true)
          }}
        >
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowActionsPopover(false)
            handleDuplicate()
          }}
        >
          <ListItemText primary="Duplicate" />
        </MenuItem>
      </Popover>
      <Paper
        elevation={2}
        sx={{
          marginRight: 2,
          marginBottom: 2,
          minWidth: 130,
          height: 150,
          maxWidth: 180,
          overflow: 'hidden',
        }}
      >
        <Button
          sx={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            padding: 0,
          }}
          onClick={handleCollectionNavigation}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              maxWidth: '100%',
            }}
          >
            <Stack
              spacing={2}
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{
                height: '100%',
                maxWidth: '100%',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="top"
                spacing={2}
                width="100%"
              >
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                    marginLeft: 2,
                    marginTop: 2,
                  }}
                >
                  {displayType}
                </Typography>
                <Tooltip title="Actions">
                  <IconButton
                    ref={actionsButtonRef}
                    onClick={(event) => {
                      event.stopPropagation()
                      setShowActionsPopover(true)
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                sx={{
                  overflow: 'hidden',
                  width: '100%',
                  alignItems: 'left',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.text.primary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '100%',
                    margin: 2,
                  }}
                >
                  {overviewItem.name}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Button>
      </Paper>
    </>
  )
}
