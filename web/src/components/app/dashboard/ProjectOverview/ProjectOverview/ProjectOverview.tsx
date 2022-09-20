import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { Branch, Project } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import { Typography, Divider, Stack, useTheme, Paper } from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { ImportDialog } from 'src/components/app/dialogs/ImportDialog'
import { EnvironmentProvider } from 'src/contexts/EnvironmentProvider'
import { userProjectBranchesVar } from 'src/contexts/reactives/UserBranches'

import { BranchSwitcherButton } from '../BranchSwitcher/BranchSwitcherButton'
import { ProjectActionsButton } from '../ProjectActionsButton'
import { findActiveBranch } from '../utils'

import { ResourceProvider } from './ResourceProvider'

type ProjectOverviewProps = {
  projectYMap: Y.Map<any>
  project: Project
}

export const ProjectOverview = ({
  projectYMap,
  project,
}: ProjectOverviewProps) => {
  const [refKey, setRefKey] = useState(0)

  // Hack as hooks don't seem to be working at the top level Y.Doc
  const refreshProjects = () => setRefKey(refKey + 1)

  return (
    <ProjectOverviewInner
      refreshProjects={refreshProjects}
      projectYMap={projectYMap}
      project={project}
      key={refKey}
    />
  )
}

const BranchContext = createContext<Y.Map<any> | null>(null)
export const useActiveBranch = () => useContext(BranchContext)

const ProjectOverviewInner = ({
  project,
  projectYMap,
  refreshProjects,
}: ProjectOverviewProps & { refreshProjects: () => void }) => {
  const theme = useTheme()
  const branches = useYMap<Branch, Record<string, Branch>>(
    projectYMap.get('branches')
  )

  const projectHook = useYMap(projectYMap)

  const userProjectBranches = useReactiveVar(userProjectBranchesVar)
  const [activeBranch, setActiveBranch] = useState(
    findActiveBranch({ branches: branches.data, userProjectBranches, project })
  )

  const branchYMap = useMemo<Y.Map<any> | null>(
    () => projectYMap?.get?.('branches')?.get?.(activeBranch?.id) ?? null,
    [projectYMap, activeBranch]
  )

  //const [sortOption, setSortOption] = useState<SortOption>('Creation Date')
  //const [sortAscending, setSortAscending] = useState(true)

  useEffect(() => {
    if (!branches.data || !userProjectBranches || !project) return
    setActiveBranch(
      findActiveBranch({
        branches: branches.data,
        userProjectBranches,
        project,
      })
    )
  }, [branches, userProjectBranches, project, setActiveBranch])

  if (!activeBranch) refreshProjects()
  if (!activeBranch || !branchYMap) return <></>

  //const sortedOverviews = sortOverviewItems(
  //  sortOption,
  //  sortAscending,
  //  unsortedOverviews
  //)

  return (
    <BranchContext.Provider value={branchYMap}>
      <ImportDialog selectedProject={projectYMap} />
      <EnvironmentProvider branchYMap={branchYMap}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center">
              <Typography variant="h5">{projectYMap.get('name')}</Typography>
              <ProjectActionsButton projectYMap={projectYMap} />
            </Stack>
            <Stack direction="row" alignItems="right" spacing={1}>
              <BranchSwitcherButton activeBranch={activeBranch} />
            </Stack>
          </Stack>
          <Divider />
          <Paper
            elevation={0}
            sx={{
              backgroundColor: theme.palette.alternate.dark,
              padding: 2,
              paddingBottom: 0,
            }}
          >
            {branchYMap ? (
              <ResourceProvider
                projectYMap={projectYMap}
                activeYBranch={branchYMap}
              />
            ) : null}
          </Paper>
        </Stack>
      </EnvironmentProvider>
    </BranchContext.Provider>
  )
}
