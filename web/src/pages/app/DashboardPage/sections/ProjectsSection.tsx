import { useReactiveVar } from '@apollo/client'
import { Stack } from '@mui/material'

import { ProjectOverview } from 'src/components/app/dashboard/projects'
import { activeWorkspaceVar, localProjectsVar } from 'src/contexts/reactives'

export const ProjectsSection = () => {
  const localProjects = useReactiveVar(localProjectsVar)
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)

  const isLocalWorkspace = activeWorkspace.__typename === 'Anonymous'

  const projects = isLocalWorkspace ? localProjects : []

  return (
    <Stack>
      {projects.map((project, index) => (
        <ProjectOverview key={index} project={project} />
      ))}
    </Stack>
  )
}
