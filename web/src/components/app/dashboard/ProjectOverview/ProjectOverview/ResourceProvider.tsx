import { useReactiveVar } from '@apollo/client'
import { Stack, Typography, Button, Box, useTheme } from '@mui/material'
import { Collection } from 'types/src'
import { useYMap } from 'zustand-yjs'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { activeWorkspaceIdVar } from 'src/contexts/reactives'

import { quickstartDialogStateVar } from '../../../dialogs'
import { OverviewItem } from '../OverviewItem'
import { QuickstartButton } from '../QuickstartButton'
import { OverviewType } from '../utils'

type ResourceProviderProps = {
  projectYMap: Y.Map<any>
  activeYBranch: Y.Doc
}

export const ResourceProvider = ({
  projectYMap,
  activeYBranch,
}: ResourceProviderProps) => {
  const theme = useTheme()
  const collections = useYMap<Collection, Record<string, Collection>>(
    activeYBranch.get('collections') || new Y.Map()
  )
  const workspaceId = useReactiveVar(activeWorkspaceIdVar)

  const unsortedOverviews = [] as OverviewType[]

  if (collections.data) {
    Object.entries(collections.data).forEach(([collectionId, collection]) => {
      unsortedOverviews.push({
        overviewItem: collection,
        yMap: collections.get(collectionId) as Y.Map<any>,
      })
    })
  }

  // TODO implement sort
  const sortedOverviews = unsortedOverviews

  return sortedOverviews.length === 0 ? (
    <Stack
      spacing={2}
      margin={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        height: 200,
      }}
    >
      <Typography variant="h6">
        No projectYMap resources have been created yet 😢
      </Typography>
      <Typography variant="caption" color={theme.palette.text.secondary}>
        Add collections, environments and more to get started
      </Typography>
      <Button
        variant="outlined"
        onClick={() =>
          quickstartDialogStateVar({
            isOpen: true,
            project: {
              id: projectYMap.get('id'),
              name: projectYMap.get('name'),
              createdAt: new Date(projectYMap.get('createdAt')),
              updatedAt: projectYMap.get('updatedAt')
                ? new Date(projectYMap.get('updatedAt'))
                : null,
              __typename: 'Project',
              __parentTypename: 'Workspace',
              parentId: workspaceId,
            },
          })
        }
        sx={{
          marginTop: 2,
        }}
      >
        Get Started
      </Button>
    </Stack>
  ) : (
    <Box
      sx={{
        flexWrap: 'wrap',
        width: '100%',
        display: 'flex',
        minHeight: 200,
      }}
    >
      {sortedOverviews.map((overview, index) => (
        <OverviewItem
          key={index}
          overviewItem={overview.overviewItem}
          yMap={overview.yMap}
        />
      ))}
      <Box
        sx={{
          marginRight: 2,
          marginBottom: 2,
        }}
      >
        <QuickstartButton projectYMap={projectYMap} />
      </Box>
    </Box>
  )
}
