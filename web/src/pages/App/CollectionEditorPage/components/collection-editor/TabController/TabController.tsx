/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useRef } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Paper, Divider } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { useCollection } from 'src/contexts/collection'
import {
  clearFocusedRESTResponse,
  focusedResponseVar,
  updateFocusedRESTResponse,
} from 'src/contexts/focused-response'
import {
  clearFocusedElement,
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
  orderingIndex: number
  needsSave?: boolean
  tabId: string
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

  const openTabsRef = useRef(openTabs)
  openTabsRef.current = openTabs

  const activeTabRef = useRef(activeTabIndex)
  activeTabRef.current = activeTabIndex

  const handleSetNeedsSave = (needsSave: boolean, tabId: string) => {
    const newOpenTabs = [...openTabsRef.current]
    const currentTabIndex = newOpenTabs.findIndex((tab) => tab.tabId === tabId)

    if (currentTabIndex !== -1) {
      newOpenTabs[currentTabIndex].needsSave = needsSave
      setOpenTabs(newOpenTabs)
    }
  }

  // Ensure tab changes in response to the focused element
  useEffect(() => {
    const focusedElement =
      focusedElementDict[getFocusedElementKey(collectionYMap)]

    if (focusedElement) {
      const focusedId = focusedElement.get('id')

      // Set the tab to the focused element
      const focusedElementIndex = openTabsRef.current.findIndex(
        (tab) => tab.topYMap.get('id') === focusedId
      )

      if (focusedElementIndex !== -1) {
        setActiveTabIndex(focusedElementIndex)

        const focusedRestResponse =
          focusedResponseDict[getFocusedElementKey(collectionYMap)]

        // If focused response does not belong to the focused element, clear it
        if (
          focusedRestResponse &&
          focusedRestResponse.get('parentId') !== focusedId
        ) {
          clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
        }

        return
      }

      if (focusedElement.get('__typename') === 'Collection') {
        const tabId = uuid()

        setOpenTabs([
          ...openTabsRef.current,
          {
            topYMap: focusedElement,
            topNode: (
              <CollectionInputPanel
                collectionYMap={focusedElement}
                setObservedNeedsSave={(needsSave) =>
                  handleSetNeedsSave(needsSave, tabId)
                }
              />
            ),
            bottomYMap: null,
            bottomNode: null,
            orderingIndex: openTabsRef.current.length,
            tabId,
          },
        ])
        setActiveTabIndex(openTabsRef.current.length)

        return
      }

      if (focusedElement.get('__typename') === 'Folder') {
        const tabId = uuid()

        setOpenTabs([
          ...openTabsRef.current,
          {
            topYMap: focusedElement,
            topNode: (
              <FolderInputPanel
                folderId={focusedElement.get('id')}
                collectionYMap={collectionYMap}
                setObservedNeedsSave={(needsSave) =>
                  handleSetNeedsSave(needsSave, tabId)
                }
              />
            ),
            bottomYMap: null,
            bottomNode: null,
            orderingIndex: openTabsRef.current.length,
            tabId,
          },
        ])
        setActiveTabIndex(openTabsRef.current.length)

        return
      }

      if (focusedElement.get('__typename') === 'RESTRequest') {
        const focusedRestResponseRaw = focusedResponseDict[
          getFocusedElementKey(collectionYMap)
        ] as YMap<any> | undefined

        const isCorrectResponse =
          focusedRestResponseRaw?.get('parentId') === focusedElement.get('id')

        const tabId = uuid()

        const newTab = determineNewRestTab({
          restResponses,
          focusedElement,
          focusedRestResponse: isCorrectResponse
            ? focusedRestResponseRaw
            : undefined,
          collectionYMap,
          setObservedNeedsSave: (needsSave: boolean) =>
            handleSetNeedsSave(needsSave, tabId),
          orderingIndex: openTabsRef.current.length,
          tabId,
        })

        setOpenTabs([...openTabsRef.current, newTab])
        setActiveTabIndex(openTabsRef.current.length)

        if (!newTab.bottomYMap) {
          clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
        }

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
      const focusedResponseIndex = openTabsRef.current.findIndex(
        (tab) => tab.bottomYMap?.get('id') === focusedResponse.get('id')
      )

      if (focusedResponseIndex !== -1) {
        setActiveTabIndex(focusedResponseIndex)
        return
      }

      // See if parent request is already open
      const parentId = focusedResponse.get('parentId')
      const parentRequestIndex = openTabsRef.current.findIndex(
        (tab) => tab.topYMap.get('id') === parentId
      )

      if (parentRequestIndex !== -1) {
        const newTabs = [...openTabsRef.current]
        newTabs[parentRequestIndex].bottomYMap = focusedResponse
        newTabs[parentRequestIndex].bottomNode = (
          <RESTResponsePanel responseYMap={focusedResponse} />
        )
        setOpenTabs(newTabs)
        setActiveTabIndex(parentRequestIndex)
        return
      }

      // Create a new tab for the focused response

      const tabId = uuid()

      setOpenTabs([
        ...openTabsRef.current,
        determineNewRestTab({
          restResponses,
          focusedElement: collectionYMap.get('restRequests').get(parentId),
          focusedRestResponse: focusedResponse,
          collectionYMap,
          setObservedNeedsSave: (needsSave: boolean) =>
            handleSetNeedsSave(needsSave, tabId),
          orderingIndex: openTabsRef.current.length,
          tabId,
        }),
      ])

      setActiveTabIndex(openTabsRef.current.length)

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

      const bottomYMap = openTabsRef.current[activeTabIndex]?.bottomYMap

      if (bottomYMap) {
        const focusedResponse =
          focusedResponseDict[getFocusedElementKey(collectionYMap)]

        if (bottomYMap.get('id') !== focusedResponse?.get('id')) {
          if (bottomYMap.get('__typename') === 'RESTResponse') {
            updateFocusedRESTResponse(focusedResponseDict, bottomYMap)
            return
          }
        }
      }
    } else if (openTabsRef.current.length === 0) {
      clearFocusedElement(focusedElementDict, collectionYMap)
      clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex])

  const handleTabDelete = (index: number) => {
    const newTabs = [...openTabsRef.current]
    newTabs.splice(index, 1)
    setOpenTabs(newTabs)

    // If was active tab, set active tab to the next tab
    if (index === activeTabIndex) {
      setActiveTabIndex(index - 1)
    } else if (index < activeTabIndex) {
      setActiveTabIndex(activeTabIndex - 1)
    }
  }

  const handleTabMove = (dragIndex: number, hoverIndex: number) => {
    // Find tab with orderingIndex === dragIndex
    const dragTab = openTabsRef.current.find(
      (tab) => tab.orderingIndex === dragIndex
    )

    if (!dragTab) {
      return
    }

    // Find tab with orderingIndex === hoverIndex
    const hoverTab = openTabsRef.current.find(
      (tab) => tab.orderingIndex === hoverIndex
    )

    if (!hoverTab) {
      return
    }

    // Swap orderingIndex
    const newDragTab = {
      ...dragTab,
      orderingIndex: hoverIndex,
    }

    const newHoverTab = {
      ...hoverTab,
      orderingIndex: dragIndex,
    }

    // Update tabs
    const newTabs = [...openTabsRef.current]
    newTabs[dragIndex] = newHoverTab
    newTabs[hoverIndex] = newDragTab

    // Find old active tab
    const oldActiveTab = openTabsRef.current[activeTabRef.current]

    // Find new active tab
    const newActiveTabIndex = newTabs.findIndex(
      (tab) => tab.tabId === oldActiveTab.tabId
    )

    if (newActiveTabIndex !== -1) {
      setOpenTabs(newTabs)
      setActiveTabIndex(newActiveTabIndex)
    }
  }

  return (
    <>
      <TabPanel
        openTabs={openTabs}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        deleteTab={handleTabDelete}
        handleMove={handleTabMove}
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
          {
            // Sort the tabs by their ordering index

            openTabs
              .sort((a, b) => a.orderingIndex - b.orderingIndex)
              .map((tab, index) => {
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
              })
          }
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
