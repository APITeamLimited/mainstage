import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { Box, Stack } from '@mui/material'
import { useYMap } from 'zustand-yjs'

import { QuickActions } from 'src/components/app/dashboard/QuickActions'
import { useWorkspace } from 'src/entity-engine'

import { Project } from 'types/src'

import { ProjectOverview } from 'src/components/app/dashboard/ProjectOverview/ProjectOverview'

export const ProjectsSection = () => {
  const workspaceDoc = useWorkspace()

  const projectsMap = workspaceDoc?.getMap<Project>('projects') || new Y.Map()
  const projects = useYMap<Project, Record<string, Project>>(projectsMap)

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
        {workspaceDoc
          ? Object.entries(projects.data).map(([projectId, project], index) => {
              return (
                <ProjectOverview
                  key={index}
                  projectYMap={projectsMap?.get(projectId)}
                  project={{
                    id: projectId,
                    __typename: 'Project',
                    __parentTypename: 'Workspace',
                    createdAt: new Date(project.createdAt),
                    updatedAt: project.updatedAt
                      ? new Date(project.updatedAt)
                      : null,
                    name: project.name,
                    parentId: workspaceDoc.guid,
                  }}
                />
              )
            })
          : null}
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
