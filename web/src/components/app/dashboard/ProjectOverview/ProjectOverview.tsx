import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Typography, Divider, Box, Stack, useTheme } from '@mui/material'

import {
  LocalCollection,
  localCollectionsVar,
  LocalProject,
} from 'src/contexts/reactives'
import { userProjectBranchesVar } from 'src/contexts/reactives/UserBranches'
import { branchesVar } from 'src/entity-engine/dispatch-handlers/Branches'

import { BranchSwitcherButton } from './BranchSwitcher/BranchSwitcherButton'
import { OverviewItem } from './OverviewItem'
import { ProjectActionsButton } from './ProjectActionsButton'
import { QuickstartButton } from './QuickstartButton'
import {
  findActiveBranch,
  OverviewType,
  SortOption,
  sortOverviewItems,
} from './utils'

type ProjectOverviewProps = {
  project: LocalProject
}

export const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  const theme = useTheme()
  const branches = useReactiveVar(branchesVar)
  const userProjectBranches = useReactiveVar(userProjectBranchesVar)
  const localCollections = useReactiveVar(localCollectionsVar)

  const [activeBranch, setActiveBranch] = useState(
    findActiveBranch({ branches, userProjectBranches, project })
  )

  const [sortOption, setSortOption] = useState<SortOption>('Creation Date')
  const [sortAscending, setSortAscending] = useState(true)

  const unsortedOverviews = [] as Array<OverviewType>

  useEffect(
    () =>
      setActiveBranch(
        findActiveBranch({ branches, userProjectBranches, project })
      ),
    [branches, userProjectBranches, project, setActiveBranch]
  )

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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" color={theme.palette.text.primary}>
              {project.name}
            </Typography>
            <ProjectActionsButton />
          </Stack>
          <Stack direction="row" alignItems="right" spacing={1}>
            <BranchSwitcherButton activeBranch={activeBranch} />
          </Stack>
        </Stack>
        <Divider />

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
      </Stack>
    </>
  )
}
