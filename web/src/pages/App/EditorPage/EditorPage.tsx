/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'

import { ROUTES } from '@apiteam/types/src'
import { useTheme, Container } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import type { Map as YMap } from 'yjs'

import { MetaTags } from '@redwoodjs/web'

import { CollectionContext } from 'src/contexts/collection'
import { EnvironmentProvider } from 'src/contexts/EnvironmentProvider'
import { useYJSModule, YJSModule } from 'src/contexts/imports'
import { VariablesProvider } from 'src/contexts/VariablesProvider'
import { VerifiedDomainsProvider } from 'src/contexts/verified-domains-provider'
import { useWorkspace } from 'src/entity-engine'
import { useYMap } from 'src/lib/zustand-yjs'
import { GlobeTestProvider } from 'src/test-manager'

import { LeftAside } from './components/LeftAside/LeftAside'
import { StatusBar } from './components/StatusBar'
import { TabController } from './components/TabController'

// App bar height + STATUS_BAR_HEIGHT
export const viewportHeightReduction = 50 + 22

type EditorPageProps = {
  projectId: string
  branchId: string
  collectionId: string
  workspaceId: string
}

export const EditorPage = ({
  projectId,
  branchId,
  collectionId,
  workspaceId,
}: EditorPageProps) => {
  const Y = useYJSModule()

  const theme = useTheme()
  const activeWorkspace = useWorkspace()

  const projectYMap = (
    activeWorkspace?.get('projects') as YMap<any> | undefined
  )?.get(projectId) as YMap<any> | undefined

  const branchYMap = (
    projectYMap?.get('branches') as YMap<any> | undefined
  )?.get(branchId) as YMap<any> | undefined

  const collectionYMap = (
    branchYMap?.get('collections') as YMap<any> | undefined
  )?.get(collectionId) as YMap<any> | undefined

  // Escape hatch in case project is deleted
  const projectHook = useYMap(projectYMap ?? new Y.Map())
  const [firstLoadedProject, setFirstLoadedProject] = useState(false)

  useEffect(() => {
    if (projectYMap?.get('__typename') === 'Project' && !firstLoadedProject) {
      setFirstLoadedProject(true)
    }

    if (!firstLoadedProject) {
      return
    }

    const interval = setInterval(() => {
      if (projectYMap?.get('__typename') !== 'Project') {
        window.location.href = ROUTES.dashboard
      }
    }, 100)

    return () => clearInterval(interval)
  }, [projectYMap, projectHook, firstLoadedProject])

  // Escape hatch in case branch is deleted
  const branchHook = useYMap(branchYMap ?? new Y.Map())
  const [firstLoadedBranch, setFirstLoadedBranch] = useState(false)

  useEffect(() => {
    if (branchYMap?.get('__typename') === 'Branch' && !firstLoadedBranch) {
      setFirstLoadedBranch(true)
    }

    if (!firstLoadedBranch) {
      return
    }

    const inteval = setInterval(() => {
      if (branchYMap?.get('__typename') !== 'Branch') {
        window.location.href = ROUTES.dashboard
      }
    }, 1000)

    return () => clearInterval(inteval)
  }, [firstLoadedBranch, branchYMap, branchHook])

  // Escape hatch in case the collection is deleted
  const collectionHook = useYMap(collectionYMap ?? new Y.Map())
  const [firstLoadedCollection, setFirstLoadedCollection] = useState(false)

  useEffect(() => {
    if (
      collectionYMap?.get('__typename') === 'Collection' &&
      !firstLoadedCollection
    ) {
      setFirstLoadedCollection(true)
    }

    if (!firstLoadedCollection) {
      return
    }

    const inteval = setInterval(() => {
      if (collectionYMap?.get('__typename') !== 'Collection') {
        window.location.href = ROUTES.dashboard
      }
    }, 1000)

    return () => clearInterval(inteval)
  }, [firstLoadedCollection, collectionYMap, collectionHook])

  const [showLeftAside, setShowLeftAside] = useState(true)

  if (!activeWorkspace) {
    return <Container>Workspace with id {workspaceId} not found</Container>
  }

  if (!branchYMap || branchYMap.get('__typename') !== 'Branch') {
    return <Container>Branch with id {branchId} not found</Container>
  }

  if (!collectionYMap || collectionYMap.get('__typename') !== 'Collection') {
    return <Container>Collection with id {collectionId} not found</Container>
  }

  return (
    <>
      <MetaTags title={collectionYMap.get('name')} />
      <EnvironmentProvider branchYMap={branchYMap}>
        <CollectionContext.Provider value={collectionYMap}>
          <VariablesProvider>
            <VerifiedDomainsProvider>
              <GlobeTestProvider />
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
                <ReflexContainer orientation="vertical">
                  <ReflexElement
                    minSize={showLeftAside ? 250 : 51}
                    maxSize={showLeftAside ? 650 : 51}
                    size={showLeftAside ? 400 : 51}
                    flex={showLeftAside ? 1 : 0}
                    style={{
                      minWidth: showLeftAside ? 250 : 51,
                      maxWidth: showLeftAside ? 650 : 51,
                      overflow: 'hidden',
                    }}
                  >
                    <LeftAside
                      showLeftAside={showLeftAside}
                      setShowLeftAside={setShowLeftAside}
                      collectionYMap={collectionYMap}
                      environmentsYMap={getOrCreateSubMap(
                        Y,
                        branchYMap,
                        'environments'
                      )}
                      testSuitesYMap={getOrCreateSubMap(
                        Y,
                        branchYMap,
                        'testSuites'
                      )}
                    />
                  </ReflexElement>
                  <ReflexSplitter
                    style={{
                      width: 8,
                      border: 'none',
                      backgroundColor: 'transparent',
                      display: showLeftAside ? undefined : 'none',
                    }}
                  />
                  <ReflexElement flex={1} minSize={600}>
                    <TabController />
                  </ReflexElement>
                </ReflexContainer>
              </div>
              <StatusBar />
            </VerifiedDomainsProvider>
          </VariablesProvider>
        </CollectionContext.Provider>
      </EnvironmentProvider>
    </>
  )
}

const getOrCreateSubMap = (
  Y: YJSModule,
  branchYMap: YMap<any>,
  key: string
): YMap<any> => {
  const subMap = branchYMap.get(key) as YMap<any> | undefined

  if (subMap) {
    return subMap
  }

  const newSubMap = new Y.Map()

  branchYMap.set(key, newSubMap)

  return newSubMap
}

export default EditorPage
