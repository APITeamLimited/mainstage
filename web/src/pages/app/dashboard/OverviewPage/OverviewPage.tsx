import { useEffect } from 'react'

import { Project } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import { Button, Stack } from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { ProjectOverview } from 'src/components/app/dashboard/ProjectOverview/ProjectOverview'
import { createProjectDialogStateVar } from 'src/components/app/dialogs'
import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'

import { NoProjectsCard } from './NoProjectsCard'

type OverviewPageProps = {
  requestedWorkspaceId?: string
}

export const OverviewPage = ({ requestedWorkspaceId }: OverviewPageProps) => {
  const workspaceDoc = useWorkspace()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const workspaces = useReactiveVar(workspacesVar)
  const projectsYMap = workspaceDoc?.getMap<Project>('projects')
  const projects = useYMap<Project, Record<string, Project>>(
    projectsYMap || new Y.Map()
  )

  const projectYMaps = Array.from(projectsYMap?.values() || [])

  useEffect(() => {
    const handleSwitch = async (tries = 0) => {
      if (tries > 10) {
        throw new Error('Could not switch workspace')
      }

      //
      await new Promise((resolve) => setTimeout(resolve, 200))

      if (requestedWorkspaceId !== activeWorkspaceId) {
        // Ensure that the workspace is loaded
        const workspace = workspaces.find(
          (workspace) => workspace.scope.id === requestedWorkspaceId
        )
        if (workspace) {
          activeWorkspaceIdVar(workspace.id)
          return
        }
        await handleSwitch(tries + 1)
      }
    }

    if (requestedWorkspaceId) handleSwitch()
  }, [requestedWorkspaceId, activeWorkspaceId, workspaces])

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="flex-end" alignItems="top">
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            createProjectDialogStateVar({
              isOpen: true,
            })
          }
        >
          New Project
        </Button>
      </Stack>
      {projectYMaps.length > 0 ? (
        <>
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
        </>
      ) : (
        <NoProjectsCard />
      )}
    </Stack>
  )
}
