import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Box, Stack } from '@mui/material'

import { ProjectOverview } from 'src/components/app/dashboard/ProjectOverview'
import { QuickActions } from 'src/components/app/dashboard/QuickActions'
import {
  activeWorkspaceIdVar,
  localProjectsVar,
  Workspace,
  workspacesVar,
} from 'src/contexts/reactives'

export const ProjectsSection = () => {
  const localProjects = useReactiveVar(localProjectsVar)
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const workspaces = useReactiveVar(workspacesVar)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    setActiveWorkspace(
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null
    )
  }, [activeWorkspaceId, workspaces])

  if (!activeWorkspace) {
    return <></>
  }

  const isLocalWorkspace = activeWorkspace.__typename === 'Local'

  const projects = localProjects

  return (
    <Stack
      alignItems="flex-start"
      justifyContent={'space-between'}
      direction="row"
      spacing={6}
    >
      <Stack
        spacing={4}
        sx={{
          width: '100%',
        }}
      >
        {projects.map((project, index) => (
          <ProjectOverview key={index} project={project} />
        ))}
      </Stack>
      <Box
        sx={{
          paddingRight: 4,
        }}
      >
        <QuickActions />
      </Box>
    </Stack>
  )
}
