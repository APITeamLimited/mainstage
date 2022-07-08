import React, { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import {
  Box,
  Button,
  Grid,
  Container,
  Typography,
  useTheme,
} from '@mui/material'
import { Allotment } from 'allotment'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'

import 'react-reflex/styles.css'
import { BrowserOnly } from '@redwoodjs/prerender/browserUtils'

import { CollectionTree } from 'src/components/app/collectionEditor/CollectionTree'
import { Splitter } from 'src/components/app/SplitPane'
import {
  activeWorkspaceVar,
  anonymousWorkspace,
  localCollectionsVar,
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
  const appBarHeight = useAppBarHeight()
  const theme = useTheme()
  const [currentAppBarHeight, setCurrentAppBarHeight] = useState(0)

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
    <div style={{ height: '100%' }}>
      <ReflexContainer orientation="vertical">
        <ReflexElement
          minSize={200}
          maxSize={400}
          style={{
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CollectionTree collection={collection} />
        </ReflexElement>
        <ReflexSplitter
          style={{
            width: 4,
            border: 'none',
            backgroundColor: theme.palette.alternate.dark,
          }}
        />
        <ReflexElement
          style={{
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <div style={{ height: '100%' }}>
            <ReflexContainer orientation="horizontal">
              <ReflexElement
                minSize={30}
                style={{
                  backgroundColor: theme.palette.background.paper,
                }}
              ></ReflexElement>
              <ReflexSplitter
                style={{
                  height: 4,
                  border: 'none',
                  backgroundColor: theme.palette.alternate.dark,
                }}
              />
              <ReflexElement
                style={{
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <div style={{ height: '50px' }}> </div>
              </ReflexElement>
            </ReflexContainer>
          </div>
        </ReflexElement>
        <ReflexSplitter
          style={{
            width: 4,
            border: 'none',
            backgroundColor: theme.palette.alternate.dark,
          }}
        />
        <ReflexElement
          minSize={50}
          maxSize={800}
          style={{
            backgroundColor: theme.palette.background.paper,
          }}
        ></ReflexElement>
      </ReflexContainer>
    </div>
  )
}
