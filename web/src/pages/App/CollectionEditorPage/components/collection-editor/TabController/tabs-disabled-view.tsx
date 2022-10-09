/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Map as YMap } from 'yjs'

import { focusedResponseVar } from 'src/contexts/focused-response'
import {
  FocusedElementDictionary,
  getFocusedElementKey,
} from 'src/contexts/reactives'

import { CollectionInputPanel } from '../CollectionInputPanel'
import { FolderInputPanel } from '../FolderInputPanel'
import { RESTInputPanel } from '../RESTInputPanel'
import { RESTResponsePanel } from '../RESTResponsePanel'

import type { OpenTab } from './TabController'

export const getTabsDisabledView = ({
  focusedElementDict,
  focusedResponseDict,
  collectionYMap,
  setOpenTabs,
  setActiveTabIndex,
}: {
  focusedElementDict: FocusedElementDictionary
  focusedResponseDict: FocusedElementDictionary
  collectionYMap: YMap<any>
  setOpenTabs: (tabs: OpenTab[]) => void
  setActiveTabIndex: (index: number) => void
}): void => {
  const focusedElement = focusedElementDict[
    getFocusedElementKey(collectionYMap)
  ] as YMap<any> | undefined

  let newTabs: OpenTab[] = []

  if (!focusedElement) {
    newTabs = []
  } else if (focusedElement.get('__typename') === 'Collection') {
    newTabs = [
      {
        topYMap: focusedElement,
        topNode: <CollectionInputPanel collectionYMap={focusedElement} />,
        bottomYMap: null,
        bottomNode: null,
      },
    ]
  } else if (focusedElement.get('__typename') === 'Folder') {
    newTabs = [
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
    ]
  } else if (focusedElement.get('__typename') === 'RESTRequest') {
    const focusedResponse = focusedResponseDict[
      getFocusedElementKey(collectionYMap)
    ] as YMap<any> | undefined

    newTabs = [
      {
        topYMap: focusedElement,
        topNode: (
          <RESTInputPanel
            requestYMap={focusedElement}
            collectionYMap={collectionYMap}
            // Key is required to force a re-render when the request changes
            key={focusedElement.get('id')}
          />
        ),
        // Don't need to know state about the bottom YMap
        bottomYMap: null,
        bottomNode: <RESTResponsePanel responseYMap={focusedResponse} />,
      },
    ]
  }

  setOpenTabs(newTabs)
  setActiveTabIndex(0)
}
