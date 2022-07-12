import React, { useEffect, useRef } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Paper, useTheme } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'

import 'react-reflex/styles.css'

import { CollectionTree } from 'src/components/app/collectionEditor/CollectionTree'
import { focusedElementVar } from 'src/components/app/collectionEditor/reactives'
import { RESTInputPanel } from 'src/components/app/collectionEditor/RESTInputPanel'
import {
  activeWorkspaceVar,
  anonymousWorkspace,
  localCollectionsVar,
} from 'src/contexts/reactives'

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
  const inputPanelHeightRef = useRef<HTMLDivElement | null>(null)

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
      style={{ height: '100%', backgroundColor: theme.palette.alternate.dark }}
    >
      <ReflexContainer orientation="vertical">
        <ReflexElement minSize={200} maxSize={400} size={250}>
          <Paper
            sx={{
              height: '100%',
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
        <ReflexElement style={{}} minSize={500}>
          <div style={{ height: '100%' }}>
            <ReflexContainer orientation="horizontal">
              <ReflexElement
                style={{
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      // Set height to inputPanelHeightRefs height
                      height: '100%',
                      borderRadius: 0,
                    }}
                  >
                    {focusedElement?.__typename === 'LocalRESTRequest' && (
                      <RESTInputPanel request={focusedElement} />
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
              <ReflexElement>
                <div style={{ height: '100%' }}>
                  <Paper
                    elevation={0}
                    sx={{ borderRadius: 0, height: '100%' }}
                  ></Paper>
                </div>
              </ReflexElement>
            </ReflexContainer>
          </div>
        </ReflexElement>
        <ReflexSplitter
          style={{
            width: 8,
            border: 'none',
            backgroundColor: 'transparent',
          }}
        />
        <ReflexElement minSize={50} maxSize={800}>
          <Paper
            sx={{
              height: '100%',
              borderRadius: 0,
            }}
            elevation={0}
          ></Paper>
        </ReflexElement>
      </ReflexContainer>
    </div>
  )
}
