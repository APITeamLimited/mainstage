import { Collection } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import { Stack, Typography, Button, Box, useTheme } from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { useYJSModule } from 'src/contexts/imports'
import { activeWorkspaceIdVar } from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

import { quickstartDialogStateVar } from '../../../dialogs'
import { OverviewItem } from '../OverviewItem'
import { QuickstartButton } from '../QuickstartButton'
import { OverviewType } from '../utils'

type ResourceProviderProps = {
  projectYMap: YMap<any>
  activeYBranch: YMap<any>
}

export const ResourceProvider = ({
  projectYMap,
  activeYBranch,
}: ResourceProviderProps) => {
  const Y = useYJSModule()

  const theme = useTheme()
  const collections = useYMap<Collection, Record<string, Collection>>(
    activeYBranch.get('collections') || new Y.Map()
  )
  const environments = useYMap<Collection, Record<string, Collection>>(
    activeYBranch.get('environments') || new Y.Map()
  )
  const workspaceId = useReactiveVar(activeWorkspaceIdVar)

  const unsortedOverviews = [] as OverviewType[]

  if (collections.data) {
    Object.entries(collections.data).forEach(([collectionId, collection]) => {
      unsortedOverviews.push({
        overviewItem: collection,
        yMap: collections.get(collectionId) as YMap<any>,
      })
    })
  }

  if (environments.data) {
    Object.entries(environments.data).forEach(
      ([environmentId, environment]) => {
        unsortedOverviews.push({
          overviewItem: { ...environment, __typename: 'Environment' },
          yMap: environments.get(environmentId) as YMap<any>,
        })
      }
    )
  }

  // TODO implement sort
  const sortedOverviews = unsortedOverviews

  return workspaceId && sortedOverviews.length === 0 ? (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        margin: 2,
        marginBottom: 4,
      }}
    >
      <Typography variant="h6">
        No project resources have been created yet
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
      }}
    >
      {sortedOverviews.map((overview, index) => (
        <OverviewItem key={index} overviewYMap={overview.yMap} />
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
