import { useEffect, useRef, useState } from 'react'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { useReactiveVar } from '@apollo/client'
import { useThrottle } from '@react-hook/throttle'
import { useDragDropManager } from 'react-dnd'
import { Folder, RESTRequest } from 'types/src'
import { useYMap } from 'zustand-yjs'

import { focusedElementVar } from 'src/contexts/reactives/FocusedElement'

import {
  createFolder,
  createRestRequest,
} from '../../../../../../../entity-engine/src/entities'

import { calculateDrop } from './calculateDrop'
import { FolderNode } from './FolderNode'
import { RESTRequestNode } from './RESTRequestNode'
import { useNodeDrag } from './useNodeDrag'
import { useNodeDrop } from './useNodeDrop'
import {
  deleteRecursive,
  duplicateRecursive,
  getNewOrderingIndex,
} from './utils'
import { DropSpace } from './utils'

export type NodeProps = {
  collectionYMap: Y.Map<any>
  nodeYMap: Y.Map<any>
  parentIndex: number
}

export type DropSpace = 'Top' | 'Bottom' | 'Inner' | null

export const Node = ({ collectionYMap, nodeYMap, parentIndex }: NodeProps) => {
  const isRoot = nodeYMap?.get('__typename') === 'Collection'

  const [collapsed, setCollapsed] = useState(isRoot ? false : true)
  const [renaming, setRenaming] = useState(false)

  const foldersYMap = collectionYMap.get('folders')

  const restRequestsYMap = collectionYMap.get('restRequests')

  // Although we are not using these, they ensure ui updates when the ymaps change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const restRequests = useYMap(restRequestsYMap)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const folders = useYMap(foldersYMap)

  const dragDropManager = useDragDropManager()
  const monitor = dragDropManager.getMonitor()
  const [dropSpace, setDropSpace] = useThrottle<DropSpace>(null)
  const nodeYMapRef = useRef<HTMLDivElement>(null)
  const renamingRef = useRef<HTMLDivElement>(null)
  const [dropResult, setDropResult] = useState<{
    parentIndex: number
    dropItem: Folder | RESTRequest
  } | null>(null)
  const [clientOffset, setClientOffset] = useState<{
    x: number
    y: number
  } | null>(null)

  const [{ isBeingDragged }, drag] = useNodeDrag({ nodeYMap, parentIndex })

  const handleDrop = (
    theDropResult: {
      parentIndex: number
      dropItem: Folder | RESTRequest
    },
    theClientOffset: {
      x: number
      y: number
    } | null
  ) => {
    setDropResult(theDropResult)
    setClientOffset(theClientOffset)
  }

  const [{ hovered, nodeYMapBeingHovered }, drop] = useNodeDrop({
    nodeYMap,
    handleDrop,
  })

  // If local rest requests change or being dragged, disable renaming
  useEffect(() => {
    if (nodeYMap.get('__typename') === 'RESTRequest') {
      setRenaming(false)
    } else if (isBeingDragged) {
      setRenaming(false)
    }
  }, [isBeingDragged, nodeYMap])

  useEffect(() => {
    calculateDrop({
      dropResult,
      clientOffset,
      nodeYMap,
      nodeYMapRef,
      parentIndex,
      foldersYMap,
      restRequestsYMap,
      setDropResult,
      setClientOffset,
      setDropSpace,
    })
  }, [
    clientOffset,
    dropResult,
    foldersYMap,
    nodeYMap,
    parentIndex,
    restRequestsYMap,
    setDropSpace,
  ])

  // Finding which half cursor is in and setting dropSpace
  useEffect(
    () =>
      monitor.subscribeToOffsetChange(() => {
        const offset = monitor.getClientOffset()
        const element = nodeYMapRef?.current?.getBoundingClientRect()

        if (element && offset && hovered) {
          if (offset.y - element.top > element.height / 2) {
            if (
              nodeYMap.get('__typename') === 'Folder' &&
              element.bottom - offset.y > 20
            ) {
              setDropSpace('Inner')
            } else {
              setDropSpace('Bottom')
            }
          } else {
            setDropSpace('Top')
          }
        } else {
          setDropSpace(null)
        }
      }),
    [
      monitor,
      nodeYMapRef,
      hovered,
      nodeYMapBeingHovered,
      parentIndex,
      nodeYMap,
      setDropSpace,
      dropSpace,
    ]
  )

  // Handle the cascading delete of this node
  const handleDelete = () => {
    deleteRecursive({
      nodeYMap,
      foldersYMap,
      restRequestsYMap,
    })
  }

  const handleNewFolder = () => {
    if (nodeYMap.get('__typename') === 'RESTRequest') {
      throw 'Cannot create a new folder inside a REST request'
    }

    const folderYMapsThisLevel = Array.from(foldersYMap.values()).filter(
      (folderYMap) => folderYMap.get('parentId') === nodeYMap.get('id')
    ) as Y.Map<any>[]

    const restRequestYMapsThisLevel = Array.from(
      restRequestsYMap.values()
    ).filter(
      (restRequestYMap) =>
        restRequestYMap.get('parentId') === nodeYMap.get('id')
    ) as Y.Map<any>[]

    const { folder, id } = createFolder({
      parentId: nodeYMap.get('id'),
      __parentTypename: nodeYMap.get('__typename'),
      orderingIndex: getNewOrderingIndex({
        folderYMaps: folderYMapsThisLevel,
        restRequestYMaps: restRequestYMapsThisLevel,
      }),
    })

    foldersYMap.set(id, folder)
  }

  const handleNewRESTRequest = () => {
    if (nodeYMap.get('__typename') === 'RESTRequest') {
      throw 'Cannot create a new REST request inside a REST request'
    }

    const folderYMapsThisLevel = Array.from(foldersYMap.values())?.filter(
      (folderYMap) => folderYMap.get('parentId') === nodeYMap.get('id')
    ) as Y.Map<any>[]

    const restRequestYMapsThisLevel = Array.from(
      restRequestsYMap.values()
    ).filter(
      (restRequestYMap) =>
        restRequestYMap.get('parentId') === nodeYMap.get('id')
    ) as Y.Map<any>[]

    const { request, id } = createRestRequest({
      parentId: nodeYMap.get('id'),
      __parentTypename: nodeYMap.get('__typename'),
      orderingIndex: getNewOrderingIndex({
        folderYMaps: folderYMapsThisLevel,
        restRequestYMaps: restRequestYMapsThisLevel,
      }),
    })

    restRequestsYMap.set(id, request)
  }

  const handleDuplicate = () =>
    duplicateRecursive({
      nodeYMap,
      foldersYMap,
      restRequestsYMap,
    })

  const handleToggle = () => setCollapsed(!collapsed)

  const getNodeChildren = ({
    nodeYMap,
  }: {
    nodeYMap: Y.Map<any>
  }): Y.Map<any>[] => {
    const unsortedFolders = Array.from(foldersYMap.values())?.filter(
      (folder) => folder.get('parentId') === nodeYMap.get('id')
    )

    const unsortedRESTRequests = Array.from(restRequestsYMap.values())?.filter(
      (restRequest) => restRequest.get('parentId') === nodeYMap.get('id')
    )

    const mergedItems = [
      ...unsortedFolders,
      ...unsortedRESTRequests,
    ] as Y.Map<any>[]

    // Sort mergedItems by orderingIndex
    return mergedItems.sort((a, b) => {
      if (a.get('orderingIndex') < b.get('orderingIndex')) {
        return -1
      }
      if (a.get('orderingIndex') > b.get('orderingIndex')) {
        return 1
      }
      return 0
    })
  }

  const handleRename = (newName: string) => {
    const id = nodeYMap.get('id')
    nodeYMap.set('name', newName)
    nodeYMap.set('updatedAt', new Date().toISOString())
    const clone = nodeYMap.clone()
    const parent = nodeYMap.parent
    if (!parent) throw 'No parent found'
    parent.delete(id)
    parent.set(id, clone)
    setRenaming(false)
  }

  const childNodes =
    nodeYMap.get('__typename') === 'Folder' ||
    nodeYMap.get('__typename') === 'Collection'
      ? getNodeChildren({
          nodeYMap,
        })
      : []

  const innerContent = (childNodes &&
    !collapsed &&
    childNodes.map((childNode, childIndex) => (
      <Node
        key={childIndex}
        parentIndex={childIndex}
        nodeYMap={childNode}
        collectionYMap={collectionYMap}
      />
    ))) as JSX.Element[]

  // Id the root element, just return innerContent
  return (
    <div
      ref={nodeYMapRef}
      style={{
        //height: isRoot ? '100%' : 'auto',
        overflowX: 'hidden',
      }}
    >
      <div
        ref={drag}
        style={
          {
            //height: isRoot ? '100%' : 'auto',
          }
        }
      >
        <div
          ref={drop}
          style={
            {
              //height: isRoot ? '100%' : 'auto',
            }
          }
        >
          {dropSpace === 'Top' && hovered && <DropSpace />}
          {isRoot && (
            <div
              style={
                {
                  //minHeight: 'calc(100% - 4rem)',
                  //paddingBottom: '4rem',
                  //display: 'flex',
                  //flexDirection: 'column',
                }
              }
            >
              {innerContent}
            </div>
          )}
          {nodeYMap.get('__typename') === 'RESTRequest' && (
            <RESTRequestNode
              isBeingDragged={isBeingDragged}
              nodeYMap={nodeYMap}
              collectionYMap={collectionYMap}
              renaming={renaming}
              renamingRef={renamingRef}
              setRenaming={setRenaming}
              handleRename={handleRename}
              handleDelete={handleDelete}
              handleDuplicate={handleDuplicate}
              dropSpace={dropSpace}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              parentIndex={parentIndex}
            />
          )}
          {nodeYMap.get('__typename') === 'Folder' && (
            <FolderNode
              isBeingDragged={isBeingDragged}
              nodeYMap={nodeYMap}
              renaming={renaming}
              renamingRef={renamingRef}
              setRenaming={setRenaming}
              handleRename={handleRename}
              handleDelete={handleDelete}
              handleDuplicate={handleDuplicate}
              dropSpace={dropSpace}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              hovered={hovered}
              innerContent={innerContent}
              handleToggle={handleToggle}
              handleNewFolder={handleNewFolder}
              handleNewRESTRequest={handleNewRESTRequest}
              parentIndex={parentIndex}
            />
          )}
          {dropSpace === 'Bottom' && hovered && <DropSpace />}
        </div>
      </div>
    </div>
  )
}
