import { useEffect } from 'react'

import { Project } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import { Button, Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { ProjectOverview } from 'src/components/app/dashboard/ProjectOverview/ProjectOverview'
import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { createProjectDialogStateVar } from 'src/components/app/dialogs'
import { useYJSModule } from 'src/contexts/imports'
import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'

import { NoProjectsCard } from './NoProjectsCard'

type OverviewPageProps = {
  requestedWorkspaceId?: string
}

export const OverviewPage = ({ requestedWorkspaceId }: OverviewPageProps) => {
  const Y = useYJSModule()

  const workspaceDoc = useWorkspace()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const workspaces = useReactiveVar(workspacesVar)

  const actveWorkspace = useWorkspaceInfo()

  const projectsYMap = workspaceDoc.getMap<Project>('projects')

  useYMap<Project, Record<string, Project>>(projectsYMap ?? new Y.Map())

  const projectYMaps = Array.from(projectsYMap?.values() || [])

  useEffect(() => {
    const handleSwitch = async (tries = 0) => {
      if (tries > 100) {
        throw new Error('Could not switch workspace')
      }

      await new Promise((resolve) => setTimeout(resolve, tries * 10))

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
    <>
      <MetaTags title={actveWorkspace?.scope.displayName} />
      <DashboardPageFrame
        actionArea={
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
        }
        title={actveWorkspace?.scope.displayName}
      >
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
      </DashboardPageFrame>
    </>
  )
}

export default OverviewPage
