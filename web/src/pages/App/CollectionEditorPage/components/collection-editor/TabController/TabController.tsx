/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Paper, Divider } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import type { Map as YMap } from 'yjs'

import { useCollection } from 'src/contexts/collection'
import {
  focusedResponseVar,
  updateFocusedRESTResponse,
} from 'src/contexts/focused-response'
import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives/FocusedElement'
import { useYMap } from 'src/lib/zustand-yjs'
import { RightAside } from 'src/pages/App/CollectionEditorPage/components/collection-editor/RightAside'

import 'react-reflex/styles.css'
import { viewportHeightReduction } from '../../../CollectionEditorPage'
import { CollectionInputPanel } from '../CollectionInputPanel'
import { FolderInputPanel } from '../FolderInputPanel'
import { RESTResponsePanel } from '../RESTResponsePanel'

import { TabPanel, tabPanelHeight } from './TabPanel'
import { determineNewRestTab } from './utils'

export type OpenTab = {
  topYMap: YMap<any>
  topNode: React.ReactNode
  bottomYMap: YMap<any> | null
  bottomNode: React.ReactNode | null
}

export const TabController = () => {
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const collectionYMap = useCollection() as YMap<any>
  useYMap(collectionYMap)

  const restResponsesYMap = collectionYMap.get('restResponses') as YMap<any>
  const restResponsesHook = useYMap(restResponsesYMap)

  const restResponses = useMemo(
    () => Array.from(restResponsesYMap.values()) as YMap<any>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [restResponsesHook]
  )

  const [showRightAside, setShowRightAside] = useState(false)

  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // Ensure tab changes in response to the focused element
  useEffect(() => {
    const focusedElement =
      focusedElementDict[getFocusedElementKey(collectionYMap)]

    if (focusedElement) {
      const focusedId = focusedElement.get('id')

      // Set the tab to the focused element
      const focusedElementIndex = openTabs.findIndex(
        (tab) => tab.topYMap.get('id') === focusedId
      )

      if (focusedElementIndex !== -1) {
        console.log(
          "Setting active tab to focused element's tab",
          focusedElementIndex
        )
        setActiveTabIndex(focusedElementIndex)

        return
      }

      if (focusedElement.get('__typename') === 'Collection') {
        setOpenTabs([
          ...openTabs,
          {
            topYMap: focusedElement,
            topNode: <CollectionInputPanel collectionYMap={focusedElement} />,
            bottomYMap: null,
            bottomNode: null,
          },
        ])
        setActiveTabIndex(openTabs.length)

        return
      }

      if (focusedElement.get('__typename') === 'Folder') {
        setOpenTabs([
          ...openTabs,
          {
            topYMap: focusedElement,
            topNode: (
              <FolderInputPanel
                folderId={focusedElement.get('id')}
                collectionYMap={collectionYMap}
              />
            ),
            bottomYMap: null,
            bottomNode: null,
          },
        ])
        setActiveTabIndex(openTabs.length)

        return
      }

      if (focusedElement.get('__typename') === 'RESTRequest') {
        const focusedRestResponse = focusedResponseDict[
          getFocusedElementKey(collectionYMap)
        ] as YMap<any> | undefined

        console.log(
          'focused',
          focusedRestResponse,
          determineNewRestTab({
            restResponses,
            focusedElement,
            focusedRestResponse,
            collectionYMap,
          })
        )

        setOpenTabs([
          ...openTabs,
          determineNewRestTab({
            restResponses,
            focusedElement,
            focusedRestResponse,
            collectionYMap,
          }),
        ])
        setActiveTabIndex(openTabs.length)

        return
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedElementDict])

  // Ensure tab changes in response to focused response
  useEffect(() => {
    const focusedResponse =
      focusedResponseDict[getFocusedElementKey(collectionYMap)]

    if (focusedResponse) {
      // Set the tab to the focused element
      const focusedResponseIndex = openTabs.findIndex(
        (tab) => tab.bottomYMap?.get('id') === focusedResponse.get('id')
      )

      if (focusedResponseIndex !== -1) {
        setActiveTabIndex(focusedResponseIndex)
        return
      }

      // See if parent request is already open
      const parentId = focusedResponse.get('parentId')
      const parentRequestIndex = openTabs.findIndex(
        (tab) => tab.topYMap.get('id') === parentId
      )

      if (parentRequestIndex !== -1) {
        const newTabs = [...openTabs]
        newTabs[parentRequestIndex].bottomYMap = focusedResponse
        newTabs[parentRequestIndex].bottomNode = (
          <RESTResponsePanel responseYMap={focusedResponse} />
        )
        setOpenTabs(newTabs)
        setActiveTabIndex(parentRequestIndex)
        return
      }

      // Create a new tab for the focused response
      setOpenTabs([
        ...openTabs,
        determineNewRestTab({
          restResponses,
          focusedElement: collectionYMap.get('restRequests').get(parentId),
          focusedRestResponse: focusedResponse,
          collectionYMap,
        }),
      ])

      setActiveTabIndex(openTabs.length)

      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponseDict])

  // Ensure focused element changes when the tab changes
  useEffect(() => {
    const topYMap = openTabs[activeTabIndex]?.topYMap
    const focusedElement =
      focusedElementDict[getFocusedElementKey(collectionYMap)]

    if (
      topYMap &&
      focusedElement &&
      topYMap.get('id') !== focusedElement.get('id')
    ) {
      updateFocusedElement(focusedElementDict, topYMap)

      const bottomYMap = openTabs[activeTabIndex]?.bottomYMap

      if (bottomYMap) {
        const focusedResponse =
          focusedResponseDict[getFocusedElementKey(collectionYMap)]

        if (bottomYMap.get('id') !== focusedResponse?.get('id')) {
          if (bottomYMap.get('__typename') === 'RESTResponse') {
            updateFocusedRESTResponse(focusedResponseDict, bottomYMap)
          }
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex])

  return (
    <>
      <TabPanel
        openTabs={openTabs}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
      />
      <ReflexContainer
        orientation="vertical"
        style={{
          height: `calc(100vh - ${viewportHeightReduction + tabPanelHeight}px)`,
        }}
      >
        <ReflexElement
          minSize={600}
          flex={1}
          style={{
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {openTabs.map((tab, index) => {
            const key = tab.topYMap.get('id')

            const showBottomPanel = tab.bottomNode !== null

            return (
              <ReflexContainer
                orientation="horizontal"
                style={{
                  // Hack to get rid of white space at top of page
                  marginTop: -1,
                  height: 'calc(100% + 2px)',
                  display: index === activeTabIndex ? 'flex' : 'none',
                }}
                key={key}
              >
                <ReflexElement
                  style={{
                    minWidth: '200px',
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: showBottomPanel ? undefined : '100%',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      // Set height to inputPanelHeightRefs height
                      height: '100%',
                      borderRadius: 0,
                      overflow: 'visible',
                    }}
                  >
                    {tab.topNode}
                  </Paper>
                </ReflexElement>
                {showBottomPanel && (
                  <ReflexSplitter
                    style={{
                      height: 8,
                      border: 'none',
                      backgroundColor: 'transparent',
                    }}
                  />
                )}
                {/* This needs a seperate node to be able to resize properly */}
                <ReflexElement
                  style={{
                    minWidth: '200px',
                    overflow: 'hidden',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 0,
                      height: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    {tab.bottomNode}
                  </Paper>
                </ReflexElement>
              </ReflexContainer>
            )
          })}
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
    </>
  )
}
