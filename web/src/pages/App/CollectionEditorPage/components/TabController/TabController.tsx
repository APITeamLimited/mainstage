/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useRef } from 'react'

import { useReactiveVar } from '@apollo/client'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import { Paper, Divider, useTheme, Stack } from '@mui/material'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { QueryDeleteDialog } from 'src/components/app/dialogs/QueryDeleteDialog'
import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
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

import 'react-reflex/styles.css'
import { viewportHeightReduction } from '../../../CollectionEditorPage'
import { CollectionInputPanel } from '../CollectionInputPanel'
import { DeletedPanel } from '../DeletedPanel'
import { FolderInputPanel } from '../FolderInputPanel'
import { RESTResponsePanel } from '../RESTResponsePanel'
import { RightAside } from '../RightAside'

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
  lastSaveCheckpoint: number
}

export const TabController = () => {
  const theme = useTheme()

  const focusedElementDict = useReactiveVar(focusedElementVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const collectionYMap = useCollection() as YMap<any>
  const collectionHook = useYMap(collectionYMap)

  const restResponsesYMap = collectionYMap.get('restResponses') as YMap<any>
  const restResponsesHook = useYMap(restResponsesYMap)

  const restRequestsYMap = collectionYMap.get('restRequests') as YMap<any>
  useYMap(restRequestsYMap)

  const foldersYMap = collectionYMap.get('folders') as YMap<any>
  useYMap(foldersYMap)

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
      newOpenTabs[currentTabIndex].lastSaveCheckpoint = Date.now()
      setOpenTabs(newOpenTabs)
    }
  }

  // Ensure tab changes in response to the focused element
  useEffect(() => {
    const focusedElement =
      focusedElementDict[getFocusedElementKey(collectionYMap)]

    if (focusedElement) {
      if (focusedElement?.get('__typename') === undefined) {
        // Clear the focused element if it's not a valid element
        clearFocusedElement(focusedElementDict, collectionYMap)
        clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
        return
      }

      const focusedId = focusedElement.get('id')

      // Set the tab to the focused element
      const focusedElementIndex = openTabsRef.current.findIndex(
        (tab) => tab.topYMap?.get('id') === focusedId
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
            lastSaveCheckpoint: Date.now(),
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
            lastSaveCheckpoint: Date.now(),
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
      if (focusedResponse.get('__typename') === undefined) {
        // Clear the focused element if it's not a valid element
        clearFocusedElement(focusedElementDict, collectionYMap)
        clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
        return
      }

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
        (tab) => tab.topYMap?.get('id') === parentId
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

      const parentElement = collectionYMap.get('restRequests')?.get(parentId)

      if (!parentElement) {
        clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
        snackErrorMessageVar('Could not find parent request for that response')
        return
      }

      setOpenTabs([
        ...openTabsRef.current,
        determineNewRestTab({
          restResponses,
          focusedElement: parentElement,
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
    } else if (!focusedElement) {
      updateFocusedElement(focusedElementDict, topYMap)

      const bottomYMap = openTabsRef.current[activeTabIndex]?.bottomYMap

      if (bottomYMap && bottomYMap.get('__typename') === 'RESTResponse') {
        updateFocusedRESTResponse(focusedResponseDict, bottomYMap)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex])

  const handleTabDelete = (index: number, force = false) => {
    const deletedTab = openTabsRef.current[index]

    // Check if tab needs to be saved
    if (!force && deletedTab.needsSave) {
      setQueryDeleteDialogTab({
        tab: deletedTab,
        type: 'unsaved',
      })
      return
    }

    const newTabs = [...openTabsRef.current]
    newTabs.splice(index, 1)

    // If any tabs have an ordering index greater than the deleted tab, decrement it
    newTabs.forEach((tab) => {
      if (tab.orderingIndex > deletedTab.orderingIndex) {
        tab.orderingIndex--
      }
    })

    setOpenTabs(newTabs)

    // If no tabs left, clear focused element
    if (newTabs.length === 0) {
      clearFocusedElement(focusedElementDict, collectionYMap)
      clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
      return
    }

    // If was active tab, set active tab to the next tab
    if (index === 0) {
      const topYMap = newTabs[0]?.topYMap

      if (topYMap) {
        updateFocusedElement(focusedElementDict, topYMap)
      } else {
        clearFocusedElement(focusedElementDict, collectionYMap)
      }

      const bottomYMap = newTabs[0]?.bottomYMap

      if (bottomYMap) {
        if (bottomYMap.get('__typename') === 'RESTResponse') {
          updateFocusedRESTResponse(focusedResponseDict, bottomYMap)
        }
      }
    } else if (index === activeTabRef.current) {
      setActiveTabIndex(index - 1)
    } else if (index < activeTabRef.current) {
      setActiveTabIndex(activeTabRef.current - 1)
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

  const [queryDeleteDialogTab, setQueryDeleteDialogTab] = useState<{
    tab: OpenTab
    type: 'unsaved'
  } | null>(null)

  const showAsidePanel = useMemo(() => {
    const topYMap = openTabs[activeTabIndex]?.topYMap
    if (!topYMap) return false

    const topYMapTypename = topYMap.get('__typename')

    if (
      topYMapTypename === 'Collection' ||
      topYMapTypename === 'Folder' ||
      topYMapTypename === 'RESTRequest'
    ) {
      return true
    }

    return false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTabs, activeTabIndex, focusedElementDict])

  useEffect(() => {
    if (!showAsidePanel && showRightAside) {
      setShowRightAside(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAsidePanel])

  const [hasSetInitalFocus, setHasSetInitalFocus] = useState(false)

  // If no focused element on first load, focus on the collection
  useEffect(() => {
    if (hasSetInitalFocus) return
    if (!collectionYMap) return

    if (
      focusedElementDict[getFocusedElementKey(collectionYMap)] === undefined
    ) {
      updateFocusedElement(focusedElementDict, collectionYMap)
      setHasSetInitalFocus(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedElementDict, collectionHook])

  const tabDeleted =
    openTabs[activeTabIndex]?.topYMap?.get('__typename') === undefined

  return (
    <>
      <QueryDeleteDialog
        show={queryDeleteDialogTab !== null}
        onDelete={() => {
          // Find tab index
          const tabIndex = openTabsRef.current.findIndex(
            (tab) => tab.tabId === queryDeleteDialogTab?.tab.tabId
          )

          if (tabIndex !== -1) {
            handleTabDelete(tabIndex, true)
          }
        }}
        onClose={() => setQueryDeleteDialogTab(null)}
        title={
          queryDeleteDialogTab?.type === 'unsaved'
            ? 'Unsaved Changes'
            : 'Close Tab'
        }
        description={
          queryDeleteDialogTab?.type === 'unsaved'
            ? `This ${
                queryDeleteDialogTab?.tab.topYMap?.get('__typename') ===
                'RESTRequest'
                  ? 'request'
                  : queryDeleteDialogTab?.tab.topYMap?.get('__typename') ===
                    'Folder'
                  ? 'folder'
                  : queryDeleteDialogTab?.tab.topYMap?.get('__typename') ===
                    'Collection'
                  ? 'collection'
                  : 'item'
              } has unsaved changes. Are you sure you want to close it?`
            : 'Are you sure you want to close this tab?'
        }
      />
      {openTabs.length > 0 && (
        <TabPanel
          openTabs={openTabs}
          activeTabIndex={activeTabIndex}
          setActiveTabIndex={setActiveTabIndex}
          deleteTab={handleTabDelete}
          handleMove={handleTabMove}
        />
      )}
      <ReflexContainer
        orientation="vertical"
        style={{
          height: `calc(100vh - ${
            viewportHeightReduction + (openTabs.length > 0 ? tabPanelHeight : 0)
          }px)`,
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
          {openTabs.length > 0 ? (
            openTabs
              .sort((a, b) => a.orderingIndex - b.orderingIndex)
              .map((tab, index) => {
                const isDeleted = tab.topYMap?.get('__typename') === undefined
                const showBottomPanel = tab.bottomNode !== null && !isDeleted

                return (
                  <ReflexContainer
                    orientation="horizontal"
                    style={{
                      // Hack to get rid of white space at top of page
                      marginTop: -1,
                      height: 'calc(100% + 2px)',
                      display: index === activeTabIndex ? 'flex' : 'none',
                    }}
                    key={tab.tabId}
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
                        {isDeleted ? (
                          <DeletedPanel key={`${tab.tabId}-disabled`} />
                        ) : (
                          tab.topNode
                        )}
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
          ) : (
            <Stack direction="row" sx={{ height: '100%' }}>
              <Divider orientation="vertical" />
              <EmptyPanelMessage
                primaryText="No tabs open"
                secondaryMessages={[
                  'Select a request, folder, or collection to get started',
                ]}
                icon={
                  <LayersClearIcon
                    sx={{
                      marginBottom: 2,
                      width: 80,
                      height: 80,
                      color: theme.palette.action.disabled,
                    }}
                  />
                }
              />
            </Stack>
          )}
        </ReflexElement>
        {!tabDeleted && showAsidePanel && showRightAside && (
          <ReflexSplitter
            style={{
              width: 8,
              border: 'none',
              backgroundColor: 'transparent',
            }}
          />
        )}
        {!tabDeleted && showAsidePanel && !showRightAside && (
          <Divider orientation="vertical" />
        )}
        {!tabDeleted && showAsidePanel && (
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
        )}
      </ReflexContainer>
    </>
  )
}
