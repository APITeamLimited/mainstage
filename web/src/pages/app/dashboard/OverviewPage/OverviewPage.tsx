import { useContext } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Box, Button, Stack } from '@mui/material'
import { Project } from '@apiteam/types'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { ProjectOverview } from 'src/components/app/dashboard/ProjectOverview/ProjectOverview'
import { QuickActions } from 'src/components/app/dashboard/QuickActions'
import { createProjectDialogStateVar } from 'src/components/app/dialogs'
import { Scrollbar } from 'src/components/app/Scrollbar'
import { activeWorkspaceIdVar } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'

import { BlankProjectsSection } from './BlankProjectsSection'

export const OverviewPage = () => {
  const workspaceDoc = useWorkspace()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const projectsYMap = workspaceDoc?.getMap<Project>('projects')
  const projects = useYMap<Project, Record<string, Project>>(
    projectsYMap || new Y.Map()
  )

  const projectYMaps = Array.from(projectsYMap?.values() || [])

  return projectYMaps.length > 0 ? (
    <Stack
      spacing={4}
      sx={{
        width: '100%',
      }}
    >
      <Stack direction="row" justifyContent="flex-end">
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
      </Stack>
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
    </Stack>
  ) : (
    <BlankProjectsSection />
  )
}
