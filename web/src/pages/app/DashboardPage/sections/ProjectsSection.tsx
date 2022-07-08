import { useReactiveVar } from '@apollo/client'
import { Box, Grid, Stack } from '@mui/material'

import { ProjectOverview } from 'src/components/app/dashboard/projects'
import { QuickActions } from 'src/components/app/dashboard/QuickActions'
import { activeWorkspaceVar, localProjectsVar } from 'src/contexts/reactives'

export const ProjectsSection = () => {
  const localProjects = useReactiveVar(localProjectsVar)
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)

  const isLocalWorkspace = activeWorkspace.__typename === 'Anonymous'

  const projects = isLocalWorkspace ? localProjects : []

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
      <QuickActions />
    </Stack>
  )
}
