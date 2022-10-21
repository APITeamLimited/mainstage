/* eslint-disable @typescript-eslint/no-explicit-any */

import { Paper, useTheme, Container } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import type { Map as YMap } from 'yjs'

import { MetaTags } from '@redwoodjs/web'

import { CollectionContext } from 'src/contexts/collection'
import { EnvironmentProvider } from 'src/contexts/EnvironmentProvider'
import { useYJSModule } from 'src/contexts/imports'
import { VariablesProvider } from 'src/contexts/VariablesProvider'
import { VerifiedDomainsProvider } from 'src/contexts/verified-domains-provider'
import { useWorkspace } from 'src/entity-engine'
import { GlobeTestProvider } from 'src/globe-test'
import { useYMap } from 'src/lib/zustand-yjs'

import { CollectionTree } from './components/CollectionTree'
import { TabController } from './components/TabController'

import 'react-reflex/styles.css'

export const viewportHeightReduction = 50

type CollectionEditorPageProps = {
  projectId: string
  branchId: string
  collectionId: string
  workspaceId: string
}

export const CollectionEditorPage = ({
  projectId,
  branchId,
  collectionId,
  workspaceId,
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

  useYMap(branchYMap ?? new Y.Map())

  // Required to prevent branch not being found errors
  useYMap(collectionYMap ?? new Y.Map())

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
            <VariablesProvider>
              <VerifiedDomainsProvider>
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
                  <ReflexElement flex={1} minSize={600}>
                    <TabController />
                  </ReflexElement>
                </ReflexContainer>
              </VerifiedDomainsProvider>
            </VariablesProvider>
          </CollectionContext.Provider>
        </EnvironmentProvider>
      </div>
    </>
  )
}

export default CollectionEditorPage
