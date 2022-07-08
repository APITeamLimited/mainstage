import { useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Typography, Divider, Box, Stack, Paper, useTheme } from '@mui/material'

import {
  LocalCollection,
  localCollectionsVar,
  LocalProject,
} from 'src/contexts/reactives'

import { OverviewItem } from './OverviewItem'
import { QuickstartButton } from './QuickstartButton'

type SortOption = 'Most Recent' | 'Alphabetical' | 'Creation Date'

type ProjectOverviewProps = {
  project: LocalProject
}

export type OverviewType = LocalCollection

const sortOverviewItems = (
  sortOption: SortOption,
  sortAscending: boolean,
  unsortedOverviews: OverviewType[]
) => {
  if (sortOption === 'Most Recent') {
    return unsortedOverviews.sort((a, b) =>
      sortAscending
        ? new Date(a.lastViewedAt).getDate() -
          new Date(b.lastViewedAt).getDate()
        : new Date(b.lastViewedAt).getDate() -
          new Date(a.lastViewedAt).getDate()
    )
  } else if (sortOption === 'Alphabetical') {
    return unsortedOverviews.sort((a, b) =>
      sortAscending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
  } else if (sortOption === 'Creation Date') {
    return unsortedOverviews.sort((a, b) =>
      sortAscending
        ? new Date(a.createdAt).getDate() - new Date(b.createdAt).getDate()
        : new Date(b.createdAt).getDate() - new Date(a.createdAt).getDate()
    )
  }
  throw `Unknown sort option: ${sortOption}`
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const theme = useTheme()
  const localCollections = useReactiveVar(localCollectionsVar)

  const [sortOption, setSortOption] = useState<SortOption>('Creation Date')
  const [sortAscending, setSortAscending] = useState(true)

  const unsortedOverviews = [] as Array<OverviewType>

  // Only check reactive variable if project is LocalProject
  if (project.__typename === 'LocalProject') {
    localCollections.forEach((collection) => {
      if (collection.parentId === project.id) {
        unsortedOverviews.push(collection)
      }
    })
  }

  const sortedOverviews = sortOverviewItems(
    sortOption,
    sortAscending,
    unsortedOverviews
  )

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h5" color={theme.palette.text.primary}>
          {project.name}
        </Typography>
        <Divider />
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor:
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[800],
          }}
          elevation={0}
        >
          {sortedOverviews.length === 0 ? (
            <Stack
              spacing={2}
              sx={{
                m: 2,
              }}
            >
              <Typography variant="body2">
                No project resources have been created yet, no time like the
                present to start!
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <QuickstartButton minWidth={500} project={project} />
              </Box>
            </Stack>
          ) : (
            <Box
              sx={{
                flexWrap: 'wrap',
                m: 2,
                width: '100%',
                display: 'flex',
              }}
            >
              {sortedOverviews.map((overview, index) => (
                <OverviewItem key={index} item={overview} />
              ))}
              <Box
                sx={{
                  marginRight: 2,
                  marginBottom: 2,
                }}
              >
                <QuickstartButton minWidth={130} project={project} />
              </Box>
            </Box>
          )}
        </Paper>
      </Stack>
    </>
  )
}
