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

import { TabPanel, tabPanelHeight } from './TabPanel'
import { getTabsDisabledView } from './tabs-disabled-view'
import { getTabsEnabledView } from './tabs-enabled-view'

export type OpenTab = {
  topYMap: YMap<any>
  topNode: React.ReactNode
  bottomYMap: YMap<any> | null
  bottomNode: React.ReactNode | null
}

type TabControllerProps = {
  enabled: boolean
}

export const TabController = ({ enabled }: TabControllerProps) => {
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const collectionYMap = useCollection() as YMap<any>
  useYMap(collectionYMap)

  const [showRightAside, setShowRightAside] = useState(false)

  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  useEffect(() => {
    console.log('activeTabIndex: ', activeTabIndex)
  }, [activeTabIndex])

  useEffect(() => {
    if (enabled) {
      getTabsEnabledView({
        existingTabs: openTabs,
        focusedElementDict,
        focusedResponseDict,
        collectionYMap,
        activeTabIndex,
        setOpenTabs,
        setActiveTabIndex,
      })
    } else {
      getTabsDisabledView({
        focusedElementDict,
        focusedResponseDict,
        collectionYMap,
        setOpenTabs,
        setActiveTabIndex,
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, activeTabIndex, focusedElementDict, focusedResponseDict])

  // Set focused element when tab is changed, broadcasts the tab controller state
  // to unrelated components
  useEffect(() => {
    if (!enabled) return

    const topYMap = openTabs[activeTabIndex]?.topYMap

    if (!topYMap) return

    // Check to make sure not already focused on the element
    const oldFocusedElementId = focusedElementDict[
      getFocusedElementKey(collectionYMap)
    ]?.get('id') as string | undefined

    const newFocusedElementId = openTabs[activeTabIndex]?.topYMap.get('id') as
      | string
      | undefined

    const oldFocusedResponseId = focusedResponseDict[
      getFocusedElementKey(collectionYMap)
    ]?.get('id') as string | undefined

    const newFocusedResponseId = openTabs[activeTabIndex]?.bottomYMap?.get(
      'id'
    ) as string | undefined

    /*if (oldFocusedElementId !== newFocusedElementId) {
      console.log(
        'Setting focused element from',
        focusedElementDict[getFocusedElementKey(collectionYMap)]?.get('name'),
        'to',
        topYMap.get('name')
      )

      updateFocusedElement(focusedElementDict, topYMap)
    }*/

    /*if (oldFocusedResponseId !== newFocusedResponseId) {
      const bottomYMap = openTabs[activeTabIndex].bottomYMap

      if (bottomYMap) {
        console.log(
          'Updating focused response to: ',
          bottomYMap.get('name'),
          bottomYMap.get('__subtype')
        )
        updateFocusedRESTResponse(focusedResponseDict, bottomYMap)
      }
    }*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex])

  return (
    <>
      {enabled && (
        <>
          <TabPanel
            openTabs={openTabs}
            activeTabIndex={activeTabIndex}
            setActiveTabIndex={setActiveTabIndex}
          />
        </>
      )}
      <ReflexContainer
        orientation="vertical"
        style={{
          height: `calc(100vh - ${
            viewportHeightReduction + (enabled ? tabPanelHeight : 0)
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
