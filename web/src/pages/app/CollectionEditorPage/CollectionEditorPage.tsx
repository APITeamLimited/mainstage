import React, { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Paper, Stack, useTheme, IconButton, Tooltip, Box } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import 'react-reflex/styles.css'

import { RESTCodeGenerator } from 'src/components/app/CodeGenerator/RESTCodeGenerator'
import { CollectionTree } from 'src/components/app/collectionEditor/CollectionTree'
import { focusedElementVar } from 'src/components/app/collectionEditor/reactives'
import { RESTInputPanel } from 'src/components/app/collectionEditor/RESTInputPanel'
import { RESTResponsePanel } from 'src/components/app/collectionEditor/RESTResponsePanel'
import { RightAside } from 'src/components/app/collectionEditor/RightAside'
import {
  activeWorkspaceVar,
  anonymousWorkspace,
  localCollectionsVar,
  RESTRequestManager,
} from 'src/contexts/reactives'
import { useAppBarHeight } from 'src/hooks/use-app-bar-height'

type CollectionEditorPageProps = {
  workspaceId: string
  collectionId: string
}

export const CollectionEditorPage = ({
  collectionId,
  workspaceId,
}: CollectionEditorPageProps) => {
  const localCollections = useReactiveVar(localCollectionsVar)
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)
  const theme = useTheme()
  const focusedElement = useReactiveVar(focusedElementVar)
  const [showRightAside, setShowRightAside] = useState(false)
  const appBarHeight = useAppBarHeight()

  useEffect(() => {
    if (workspaceId !== activeWorkspace.id) {
      if (workspaceId === 'ANONYMOUS_ID') {
        activeWorkspaceVar(anonymousWorkspace)
      } else {
        throw `Unknown workspace id: ${workspaceId}, remote workspaces not supported yet`
      }
    }
  }, [workspaceId, activeWorkspace])

  // Check if the collection exists in the local collectioQWns
  const collection = localCollections.find(
    (collection) => collection.id === collectionId
  )

  if (!collection) {
    return <div>Collection not found</div>
  }

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: theme.palette.alternate.dark,
        width: '100%',
      }}
    >
      <RESTRequestManager />
      <ReflexContainer orientation="vertical" windowResizeAware>
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
            <CollectionTree collection={collection} />
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
                    {focusedElement?.__typename === 'LocalRESTRequest' && (
                      <RESTInputPanel
                        request={focusedElement}
                        // Key is required to force a re-render when the request changes
                        key={focusedElement.id}
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
                }}
              >
                <div style={{ height: '100%' }}>
                  <Paper
                    elevation={0}
                    sx={{ borderRadius: 0, height: '100%', overflow: 'hidden' }}
                  >
                    {focusedElement?.__typename === 'LocalRESTRequest' && (
                      <RESTResponsePanel />
                    )}
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
            maxWidth: showRightAside ? '700px' : '50px',
            height: `calc(100vh - ${appBarHeight}px)`,
          }}
          size={showRightAside ? 300 : 50}
        >
          <Paper
            sx={{
              height: '100%',
              margin: 0,
              padding: 0,
              borderRadius: 0,
              overflowY: 'hidden',
            }}
            elevation={0}
          >
            <RightAside
              setShowRightAside={setShowRightAside}
              showRightAside={showRightAside}
            />
          </Paper>
        </ReflexElement>
      </ReflexContainer>
    </div>
  )
}
