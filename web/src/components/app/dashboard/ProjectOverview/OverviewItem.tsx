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
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'zustand-yjs'

import { routes, navigate } from '@redwoodjs/router'

import { activeWorkspaceIdVar } from 'src/contexts/reactives'

import { QueryDeleteDialog } from '../../dialogs/QueryDeleteDialog'
import { RenameDialog } from '../../dialogs/RenameDialog'
import { SingleEnvironmentEditor } from '../../EnvironmentManager/SingleEnvironmentEditor'

type OverviewItemProps = {
  overviewYMap: YMap<any>
}

export function OverviewItem({ overviewYMap }: OverviewItemProps) {
  const theme = useTheme()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const [showActionsPopover, setShowActionsPopover] = useState(false)
  const actionsButtonRef = useRef<HTMLButtonElement>(null)

  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)

  const [showEnvironmentManager, setShowEnvironmentManager] = useState(false)

  useYMap(overviewYMap)

  const handleDuplicate = () => {
    const newItem = overviewYMap.clone()
    const newId = uuid()
    newItem.set('id', newId)
    newItem.set('name', `${overviewYMap.get('name')} (copy)`)
    newItem.set('createdAt', new Date().toISOString())
    newItem.set('updatedAt', null)
    overviewYMap.parent?.set(newId, newItem)

    // If is a collection, need to change parentIDs
    if (newItem.get('__typename') === 'Collection') {
      Array.from(newItem.get('folders').values()).forEach((folder) => {
        if (folder.get('parentId') === overviewYMap.get('id')) {
          folder.set('parentId', newId)
        }
      })

      Array.from(newItem.get('restRequests').values()).forEach(
        (restRequest) => {
          if (restRequest.get('parentId') === overviewYMap.get('id')) {
            restRequest.set('parentId', newId)
          }
        }
      )

      Array.from(newItem.get('restResponses').values()).forEach(
        (restResponse) => {
          if (restResponse.get('parentId') === overviewYMap.get('id')) {
            restResponse.set('parentId', newId)
          }
        }
      )
    }

    console.log('Newoverviewitem', newItem)
  }

  const handleRename = (newName: string) => {
    overviewYMap.set('name', newName)
    overviewYMap.set('updatedAt', new Date().toISOString())
  }

  const handleDelete = () => {
    overviewYMap.parent?.delete(overviewYMap.get('id'))
  }

  const getTypeName = () => {
    const typename = overviewYMap.get('__typename')
    if (typename === 'Collection') {
      return 'Collection'
    } else if (typename === 'Environment') {
      return 'Environment'
    } else {
      console.log(overviewYMap)
      throw `Unknown type: ${typename}`
    }
  }

  const displayType = getTypeName()

  const handleOverviewClick = () => {
    if (displayType === 'Collection') {
      // Navigate to the collection editor page
      const branch = overviewYMap.parent?.parent
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
          collectionId: overviewYMap.get('id'),
        }
      }

      return navigate(routes.collectionEditor(params))
    } else if (displayType === 'Environment') {
      setShowEnvironmentManager(true)
    }
  }

  return (
    <>
      {displayType === 'Environment' && (
        <SingleEnvironmentEditor
          show={showEnvironmentManager}
          setShow={setShowEnvironmentManager}
          environmentYMap={overviewYMap}
        />
      )}
      <RenameDialog
        show={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onRename={handleRename}
        original={overviewYMap.get('name')}
        title={`Rename ${displayType}`}
      />
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onDelete={handleDelete}
        onClose={() => setShowQueryDeleteDialog(false)}
        title={`Delete ${displayType}`}
        description={`Are you sure you want to delete ${displayType} ${overviewYMap.get(
          'name'
        )}?`}
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
          onClick={handleOverviewClick}
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
                    component="span"
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
                  {overviewYMap.get('name')}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Button>
      </Paper>
    </>
  )
}
