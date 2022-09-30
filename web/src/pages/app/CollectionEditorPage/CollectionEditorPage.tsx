import React, { createContext, useContext, useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Paper, useTheme, Container, Divider } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { MetaTags } from '@redwoodjs/web'

import { CollectionInputPanel } from 'src/components/app/collection-editor/ColectionInputPanel/CollectionInputPanel'
import { CollectionTree } from 'src/components/app/collection-editor/CollectionTree'
import { FolderInputPanel } from 'src/components/app/collection-editor/FolderInputPanel'
import { RESTInputPanel } from 'src/components/app/collection-editor/RESTInputPanel'
import { RESTResponsePanel } from 'src/components/app/collection-editor/RESTResponsePanel'
import { RightAside } from 'src/components/app/collection-editor/RightAside'
import { EnvironmentProvider } from 'src/contexts/EnvironmentProvider'
import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives/FocusedElement'
import { RESTRequestFocusWatcher } from 'src/contexts/state-watchers/RESTRequestFocusWatcher'
import { useWorkspace } from 'src/entity-engine'
import { GlobeTestProvider } from 'src/globe-test'

import 'react-reflex/styles.css'

type CollectionEditorPageProps = {
  workspaceId: string
  projectId: string
  branchId: string
  collectionId: string
}

const CollectionContext = createContext<Y.Map<any> | null>(null)
export const useCollection = () => useContext(CollectionContext)

export const CollectionEditorPage = ({
  workspaceId,
  projectId,
  branchId,
  collectionId,
}: CollectionEditorPageProps) => {
  const workspace = useWorkspace()
  const theme = useTheme()
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const [showRightAside, setShowRightAside] = useState(false)
  const activeWorkspace = useWorkspace()
  const collectionYMap = workspace
    ?.get('projects')
    ?.get(projectId)
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId)
  useYMap(collectionYMap || new Y.Map())

  const viewportHeightReduction = 60.3

  // If no focused element, focus on the collection
  useEffect(() => {
    if (!collectionYMap) return

    if (
      focusedElementDict[getFocusedElementKey(collectionYMap)] === undefined
    ) {
      updateFocusedElement(focusedElementDict, collectionYMap)
    }
  }, [focusedElementDict, collectionYMap])

  if (!activeWorkspace) {
    return <Container>Workspace with id {workspaceId} not found</Container>
  }

  if (!collectionYMap) {
    return <Container>Collection with id {collectionId} not found</Container>
  }

  return (
    <>
      <MetaTags title={collectionYMap.get('name')} />
      <div
        style={{
          display: 'fixed',
          maxHeight: `calc(100vh - ${viewportHeightReduction}px)`,
          height: `calc(100vh - ${viewportHeightReduction}px)`,
          backgroundColor: theme.palette.alternate.dark,
          width: '100%',
          minWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <EnvironmentProvider branchYMap={collectionYMap.parent.parent}>
          <CollectionContext.Provider value={collectionYMap}>
            <GlobeTestProvider />
            <RESTRequestFocusWatcher collectionYMap={collectionYMap} />
            <ReflexContainer orientation="vertical">
              <ReflexElement
                minSize={200}
                maxSize={4000}
                size={450}
                flex={1}
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
              <ReflexElement
                minSize={600}
                flex={1}
                style={{
                  overflow: 'hidden',
                }}
              >
                <ReflexContainer
                  orientation="horizontal"
                  windowResizeAware
                  style={{
                    // Hack to get rid of white space at top of page
                    height: `calc(100vh - ${viewportHeightReduction - 1}px)`,
                    marginTop: -1,
                  }}
                >
                  <ReflexElement>
                    <Paper
                      elevation={0}
                      sx={{
                        // Set height to inputPanelHeightRefs height
                        height: '100%',
                        borderRadius: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {focusedElementDict[
                        getFocusedElementKey(collectionYMap)
                      ]?.get?.('__typename') === 'Collection' && (
                        <CollectionInputPanel collectionYMap={collectionYMap} />
                      )}
                      {focusedElementDict[
                        getFocusedElementKey(collectionYMap)
                      ]?.get?.('__typename') === 'Folder' && (
                        <FolderInputPanel
                          folderId={focusedElementDict[
                            getFocusedElementKey(collectionYMap)
                          ]?.get('id')}
                          collectionYMap={collectionYMap}
                        />
                      )}
                      {focusedElementDict[
                        getFocusedElementKey(collectionYMap)
                      ]?.get?.('__typename') === 'RESTRequest' && (
                        <RESTInputPanel
                          requestId={focusedElementDict[
                            getFocusedElementKey(collectionYMap)
                          ]?.get('id')}
                          collectionYMap={collectionYMap}
                          // Key is required to force a re-render when the request changes
                          key={focusedElementDict[
                            getFocusedElementKey(collectionYMap)
                          ]?.get('id')}
                        />
                      )}
                    </Paper>
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
                        {focusedElementDict[
                          getFocusedElementKey(collectionYMap)
                        ]?.get('__typename') === 'RESTRequest' && (
                          <RESTResponsePanel collectionYMap={collectionYMap} />
                        )}
                      </Paper>
                    </div>
                  </ReflexElement>
                </ReflexContainer>
              </ReflexElement>
              {showRightAside && (
                <ReflexSplitter
                  style={{
                    width: 8,
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                />
              )}
              {!showRightAside && <Divider orientation="vertical" />}
              <ReflexElement
                flex={showRightAside ? 1 : 0}
                style={{
                  minWidth: showRightAside ? '300px' : '50px',
                  maxWidth: showRightAside ? '1000px' : '50px',
                  overflow: 'hidden',
                }}
                minSize={showRightAside ? 300 : 50}
                maxSize={showRightAside ? 1000 : 50}
                size={showRightAside ? 500 : 50}
                propagateDimensions={true}
              >
                <RightAside
                  setShowRightAside={setShowRightAside}
                  showRightAside={showRightAside}
                  collectionYMap={collectionYMap}
                />
              </ReflexElement>
            </ReflexContainer>
          </CollectionContext.Provider>
        </EnvironmentProvider>
      </div>
    </>
  )
}

export default CollectionEditorPage
