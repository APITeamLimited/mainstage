import { useContext } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Box, Button, Stack } from '@mui/material'
import { Project } from 'types/src'
import { useYMap } from 'zustand-yjs'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { ProjectOverview } from 'src/components/app/dashboard/ProjectOverview/ProjectOverview'
import { QuickActions } from 'src/components/app/dashboard/QuickActions'
import { createProjectDialogStateVar } from 'src/components/app/dialogs'
import { Scrollbar } from 'src/components/app/Scrollbar'
import { activeWorkspaceIdVar } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'
import { AppBarHeightContext } from 'src/layouts/App'

import { BlankProjectsSection } from './BlankProjectsSection'

export const ProjectsSection = () => {
  const workspaceDoc = useWorkspace()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const projectsYMap = workspaceDoc?.getMap<Project>('projects')
  const projects = useYMap<Project, Record<string, Project>>(
    projectsYMap || new Y.Map()
  )

  const projectYMaps = Array.from(projectsYMap?.values() || [])

  const appBarHeight = useContext(AppBarHeightContext)

  return projectYMaps.length > 0 ? (
    <Stack
      alignItems="flex-start"
      justifyContent={'space-between'}
      direction="row"
      spacing={4}
      key={activeWorkspaceId}
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          maxHeight: '100%',
        }}
      >
        <Scrollbar
          style={{
            height: `calc(100vh - ${appBarHeight + 160}px)`,
            paddingRight: '2rem',
          }}
        >
          <Stack spacing={4}>
            {workspaceDoc
              ? projectYMaps.map((project, index) => {
                  return (
                    <ProjectOverview
                      key={index}
                      projectYMap={project}
                      project={{
                        id: project.get('id'),
                        __typename: 'Project',
                        __parentTypename: 'Workspace',
                        createdAt: new Date(project.get('createdAt')),
                        updatedAt: project.get('updatedAt')
                          ? new Date(project.get('updatedAt'))
                          : null,
                        name: project.get('name'),
                        parentId: workspaceDoc.guid,
                      }}
                    />
                  )
                })
              : null}
            <Box display="flex" alignItems="center" justifyContent="center">
              <Button
                variant="outlined"
                color="primary"
                onClick={() =>
                  createProjectDialogStateVar({
                    isOpen: true,
                  })
                }
              >
                Create New Project
              </Button>
            </Box>
          </Stack>
        </Scrollbar>
      </Box>
      <Box>
        <QuickActions />
      </Box>
    </Stack>
  ) : (
    <BlankProjectsSection />
  )
}
