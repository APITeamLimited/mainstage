/* eslint-disable @typescript-eslint/no-explicit-any */

import { Paper, useTheme, Container } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import type { Map as YMap } from 'yjs'

import { MetaTags } from '@redwoodjs/web'

import { CollectionContext } from 'src/contexts/collection'
import { EnvironmentProvider } from 'src/contexts/EnvironmentProvider'
import { useYJSModule } from 'src/contexts/imports'
import { useWorkspace } from 'src/entity-engine'
import { GlobeTestProvider } from 'src/globe-test'
import { useYMap } from 'src/lib/zustand-yjs'

import 'react-reflex/styles.css'
import { CollectionTree } from './components/CollectionTree'
import { FocusGuard } from './components/ContextGuard'
import { TabController } from './components/TabController'

export const viewportHeightReduction = 50

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
  const Y = useYJSModule()

  const theme = useTheme()
  const activeWorkspace = useWorkspace()

  const branchYMap = (
    (
      (activeWorkspace?.get('projects') as YMap<any> | undefined)?.get(
        projectId
      ) as YMap<any> | undefined
    )?.get('branches') as YMap<any> | undefined
  )?.get(branchId) as YMap<any> | undefined

  const collectionYMap = (
    branchYMap?.get('collections') as YMap<any> | undefined
  )?.get(collectionId) as YMap<any> | undefined

  useYMap(collectionYMap || new Y.Map())

  if (!activeWorkspace) {
    return <Container>Workspace with id {workspaceId} not found</Container>
  }

  if (!branchYMap) {
    return <Container>Branch with id {branchId} not found</Container>
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
        <EnvironmentProvider branchYMap={branchYMap}>
          <CollectionContext.Provider value={collectionYMap}>
            <GlobeTestProvider />
            <ReflexContainer orientation="vertical">
              <ReflexElement
                minSize={200}
                maxSize={600}
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
              <ReflexElement flex={1} minSize={400}>
                <TabController />
              </ReflexElement>
            </ReflexContainer>
            s
          </CollectionContext.Provider>
        </EnvironmentProvider>
      </div>
    </>
  )
}

export default CollectionEditorPage
