import { useReactiveVar } from '@apollo/client'
import { Box, Stack } from '@mui/material'
import { Project } from 'types/src'
import { useYMap } from 'zustand-yjs'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { ProjectOverview } from 'src/components/app/dashboard/ProjectOverview/ProjectOverview'
import { QuickActions } from 'src/components/app/dashboard/QuickActions'
import { activeWorkspaceIdVar } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'

export const ProjectsSection = () => {
  const workspaceDoc = useWorkspace()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const projectsMap = workspaceDoc?.getMap<Project>('projects')
  const projects = useYMap<Project, Record<string, Project>>(
    projectsMap || new Y.Map()
  )
  //console.log('projects', projects.data)

  return (
    <Stack
      alignItems="flex-start"
      justifyContent={'space-between'}
      direction="row"
      spacing={6}
      key={activeWorkspaceId}
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
                  projectYMap={projectsMap?.get?.(projectId) || new Y.Map()}
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
