/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Map as YMap } from 'yjs'

import {
  FocusedElementDictionary,
  getFocusedElementKey,
} from 'src/contexts/reactives'

import { CollectionInputPanel } from '../CollectionInputPanel'
import { FolderInputPanel } from '../FolderInputPanel'
import { RESTInputPanel } from '../RESTInputPanel'
import { RESTResponsePanel } from '../RESTResponsePanel'

import type { OpenTab } from './TabController'

export const getTabsEnabledView = ({
  existingTabs,
  focusedElementDict,
  focusedResponseDict,
  collectionYMap,
  activeTabIndex,
  setOpenTabs,
  setActiveTabIndex,
}: {
  existingTabs: OpenTab[]
  focusedElementDict: FocusedElementDictionary
  focusedResponseDict: FocusedElementDictionary
  collectionYMap: YMap<any>
  activeTabIndex: number
  setOpenTabs: (tabs: OpenTab[]) => void
  setActiveTabIndex: (index: number) => void
}) => {
  const focusedElement = focusedElementDict[
    getFocusedElementKey(collectionYMap)
  ] as YMap<any> | undefined

  if (!focusedElement) {
    return existingTabs
  }

  // Check if the focused element is already in the tabs
  const focusedElementIndex = existingTabs.findIndex(
    (tab) => tab.topYMap.get('id') === focusedElement.get('id')
  )

  if (focusedElement.get('__typename') === 'Collection') {
    if (focusedElementIndex === -1) {
      const newOpenTab = {
        topYMap: focusedElement,
        topNode: <CollectionInputPanel collectionYMap={focusedElement} />,
        bottomYMap: null,
        bottomNode: null,
      }

      const newTabs = [...existingTabs, newOpenTab]
      setOpenTabs(newTabs)
      setActiveTabIndex(newTabs.length - 1)
    } else {
      if (activeTabIndex !== focusedElementIndex) {
        setActiveTabIndex(focusedElementIndex)
      }
    }
  } else if (focusedElement.get('__typename') === 'Folder') {
    if (focusedElementIndex === -1) {
      const newOpenTab: OpenTab = {
        topYMap: focusedElement,
        topNode: (
          <FolderInputPanel
            folderId={focusedElement.get('id')}
            collectionYMap={collectionYMap}
          />
        ),
        bottomYMap: null,
        bottomNode: null,
      }

      const newTabs = [...existingTabs, newOpenTab]

      setOpenTabs(newTabs)
      setActiveTabIndex(newTabs.length - 1)
    } else {
      if (activeTabIndex !== focusedElementIndex) {
        setActiveTabIndex(focusedElementIndex)
      }
    }
  } else if (focusedElement.get('__typename') === 'RESTRequest') {
    const restRequests = (
      Array.from(
        (collectionYMap.get('restResponses') as YMap<any>).values()
      ) as YMap<any>[]
    ).filter(
      (responseYMap) =>
        responseYMap.get('parentId') === focusedElement.get('id')
    )

    // Find focused rest response
    const focusedRestResponse = focusedResponseDict[
      getFocusedElementKey(collectionYMap)
    ] as YMap<any> | undefined

    // Already have an open tab for the focused element
    // Only switch if not already on a tab with the focused element
    if (focusedElementIndex !== -1) {
      const bottomYMapId =
        existingTabs[focusedElementIndex]?.bottomYMap?.get('id')

      if (
        bottomYMapId !== undefined &&
        bottomYMapId !== focusedRestResponse?.get('id')
      ) {
        console.log(
          'Updating bottomYMap',
          bottomYMapId,
          focusedRestResponse?.get('name'),
          focusedRestResponse?.get('__subtype')
        )

        // Set the bottomYmap for the active tab
        existingTabs[activeTabIndex].bottomYMap = focusedRestResponse ?? null
        existingTabs[activeTabIndex].bottomNode = (
          <RESTResponsePanel responseYMap={focusedRestResponse} />
        )

        setOpenTabs([...existingTabs])
        setActiveTabIndex(focusedElementIndex)
      }
    } else {
      // Going to need to add a new tab
      const bottomYMap = determineRestResponse({
        restRequests,
        focusedRestResponse,
      })

      const newOpenTab: OpenTab = {
        topYMap: focusedElement,
        topNode: (
          <RESTInputPanel
            requestYMap={focusedElement}
            collectionYMap={collectionYMap}
          />
        ),
        bottomYMap,
        bottomNode: (
          <RESTResponsePanel responseYMap={bottomYMap ?? undefined} />
        ),
      }

      setOpenTabs([...existingTabs, newOpenTab])
      setActiveTabIndex(existingTabs.length)
    }
  }
}

const determineRestResponse = ({
  focusedRestResponse,
  restRequests,
}: {
  focusedRestResponse: YMap<any> | undefined
  restRequests: YMap<any>[]
}): YMap<any> | null => {
  // If there is a focused rest response, and it is in the list of rest responses
  // for the focused rest request, then set the bottomYMap to the focused rest response
  if (
    focusedRestResponse &&
    restRequests.find(
      (restRequest) => restRequest.get('id') === focusedRestResponse.get('id')
    )
  ) {
    return focusedRestResponse
  }
  // Else find the most recent rest response
  return restRequests.reduce((mostRecent, restRequest) => {
    if (
      !mostRecent ||
      new Date(restRequest.get('createdAt')) >
        new Date(mostRecent.get('createdAt'))
    ) {
      return restRequest
    }

    return mostRecent
  }, null as YMap<any> | null)
}
