import React, { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Paper, useTheme, Box, Container } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import * as Y from 'yjs'

import 'react-reflex/styles.css'

import { Workspace } from 'types/src'
import { useYMap } from 'zustand-yjs'

import { CollectionTree } from 'src/components/app/collection-editor/CollectionTree'
import { RESTInputPanel } from 'src/components/app/collection-editor/RESTInputPanel'
import { RightAside } from 'src/components/app/collection-editor/RightAside'
import { EnvironmentProvider } from 'src/contexts/EnvironmentProvider'
import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'
import { focusedElementVar } from 'src/contexts/reactives/FocusedElement'
import { useWorkspace } from 'src/entity-engine'
import { GlobeTestProvider } from 'src/globe-test'

type CollectionEditorPageProps = {
  workspaceId: string
  projectId: string
  branchId: string
  collectionId: string
}

export const CollectionEditorPage = ({
  workspaceId,
  projectId,
  branchId,
  collectionId,
}: CollectionEditorPageProps) => {
  const workspaces = useReactiveVar(workspacesVar)
  const workspace = useWorkspace()
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const theme = useTheme()
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const [showRightAside, setShowRightAside] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const collectionYMap = workspace
    ?.get('projects')
    ?.get(projectId)
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId)
  const collection = useYMap(collectionYMap || new Y.Map())

  const viewportHeightReduction = 60.3

  useEffect(() => {
    // Set activeWorkspaceId to the workspaceId if different from the current workspaceId
    if (workspaceId !== activeWorkspaceId) {
      activeWorkspaceIdVar(workspaceId)
    }
  }, [activeWorkspaceId, workspaceId])

  useEffect(() => {
    setActiveWorkspace(
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null
    )
  }, [activeWorkspaceId, workspaces])

  if (!activeWorkspace) {
    return <Container>Workspace with id {workspaceId} not found</Container>
  }

  if (!collectionYMap) {
    return <Container>Collection with id {collectionId} not found</Container>
  }

  return (
    <div
      style={{
        display: 'fixed',
        maxHeight: `calc(100vh - ${viewportHeightReduction}px)`,
        height: `calc(100vh - ${viewportHeightReduction}px)`,
        backgroundColor: theme.palette.alternate.dark,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <EnvironmentProvider branchYMap={collectionYMap.parent.parent}>
        <GlobeTestProvider />
        <ReflexContainer orientation="vertical">
          <ReflexElement
            minSize={200}
            maxSize={4000}
            size={200}
            flex={2}
            style={{
              minWidth: '200px',
            }}
          >
            <Paper
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: 0,
              }}
              elevation={10}
            >
              <CollectionTree collectionYMap={collectionYMap} />
            </Paper>
          </ReflexElement>
          <ReflexSplitter
            style={{
              width: 8,
              border: 'none',
              backgroundColor: 'transparent',
            }}
          />
          <ReflexElement minSize={500} flex={1}>
            <div style={{ height: '100%', width: '100%' }}>
              <ReflexContainer orientation="horizontal" windowResizeAware>
                <ReflexElement>
                  <div
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        // Set height to inputPanelHeightRefs height
                        height: '100%',
                        borderRadius: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {focusedElementDict[collectionId]?.get?.('__typename') ===
                        'RESTRequest' && (
                        <RESTInputPanel
                          requestId={focusedElementDict[collectionId]?.get(
                            'id'
                          )}
                          collectionYMap={collectionYMap}
                          // Key is required to force a re-render when the request changes
                          key={focusedElementDict[collectionId]?.get('id')}
                        />
                      )}
                    </Paper>
                  </div>
                </ReflexElement>
                <ReflexSplitter
                  style={{
                    height: 8,
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                />
                <ReflexElement
                  style={{
                    minWidth: '200px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ height: '100%' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 0,
                        height: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      {/*focusedElementDict?.__typename === 'RESTRequest' && (
                      <RESTResponsePanel />
                    )*/}
                    </Paper>
                  </div>
                </ReflexElement>
              </ReflexContainer>
            </div>
          </ReflexElement>
          {showRightAside ? (
            <ReflexSplitter
              style={{
                width: 8,
                border: 'none',
                backgroundColor: 'transparent',
              }}
            />
          ) : (
            <Box
              sx={{
                backgroundColor: theme.palette.divider,
              }}
            >
              <ReflexSplitter
                style={{
                  width: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                }}
              />
            </Box>
          )}
          <ReflexElement
            flex={2}
            style={{
              minWidth: showRightAside ? '300px' : '50px',
              maxWidth: showRightAside ? '1000px' : '50px',
            }}
            size={showRightAside ? 300 : 50}
          >
            <Paper
              sx={{
                height: '100%',
                width: '100%',
                maxWidth: '100%',
                margin: 0,
                padding: 0,
                borderRadius: 0,
                overflowY: 'hidden',
              }}
              elevation={0}
            >
              {
                <RightAside
                  setShowRightAside={setShowRightAside}
                  showRightAside={showRightAside}
                  collectionYMap={collectionYMap}
                />
              }
            </Paper>
          </ReflexElement>
        </ReflexContainer>
      </EnvironmentProvider>
    </div>
  )
}
