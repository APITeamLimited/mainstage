import { useReactiveVar } from '@apollo/client'
import { Box, Divider } from '@mui/material'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Flipper } from 'react-flip-toolkit'
import {
  Sortly,
  ID,
  ItemData,
  ContextProvider as SortlyContextProvider,
} from 'web/lib/react-sortly'

import {
  activeWorkspaceVar,
  BaseLocal,
  LocalCollection,
  LocalFolder,
  localFoldersVar,
  LocalRESTRequest,
  localRESTRequestsVar,
} from 'src/contexts/reactives'

import { CollectionTopMenu } from './CollectionTopMenu'
import { ItemRenderer } from './ItemRenderer'

type CollectionTreeProps = {
  collection: LocalCollection
}

interface BlankSpace extends BaseLocal {
  __typename: 'BlankSpace'
  id: string
  parentId: string
  __parentTypename: 'LocalFolder' | 'LocalCollection'
  orderingIndex: number
}

type NewBlankSpaceProps = {
  parentId: string
  __parentTypename: 'LocalFolder' | 'LocalCollection'
  orderingIndex: number
}

const newBlankSpace = ({
  parentId,
  __parentTypename,
  orderingIndex,
}: NewBlankSpaceProps): BlankSpace => ({
  __typename: 'BlankSpace',
  id: `${parentId}-child-blank-space`,
  parentId,
  __parentTypename,
  createdAt: new Date(),
  updatedAt: null,
  orderingIndex,
})

type NodeChild = LocalFolder | LocalRESTRequest | BlankSpace

// NodeItem stores flattned list with collapsed state
export type NodeItem = {
  item: NodeChild
  collapsed?: boolean
}

type GetNodeChilrenProps = {
  node: LocalCollection | LocalFolder
  depth?: number
}

export const CollectionTree = ({ collection }: CollectionTreeProps) => {
  const localFolders = useReactiveVar(localFoldersVar)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)
  const isLocalWorkspace = activeWorkspace.__typename === 'Anonymous'

  const getNodeChildren = ({
    node,
    depth = 0,
  }: GetNodeChilrenProps): ItemData<NodeItem>[] => {
    const unsortedFolders = localFolders.filter(
      (folder) => folder.parentId === node.id
    )
    const unsortedRESTRequests = localRESTRequests.filter(
      (restRequest) => restRequest.parentId === node.id
    )

    // For each folder recursively add its children
    const nestedItems = unsortedFolders.flatMap((folder) =>
      getNodeChildren({ node: folder, depth: depth + 1 })
    )

    const mergedItems: NodeChild[] = [
      ...unsortedFolders,
      ...unsortedRESTRequests,
    ]

    // Sort mergedItems by orderingIndex
    const sortedItems = mergedItems.sort((a, b) => {
      if (a.orderingIndex < b.orderingIndex) {
        return -1
      }
      if (a.orderingIndex > b.orderingIndex) {
        return 1
      }
      return 0
    })

    // Add blank space between each sorted item

    const blankSpaces = [
      newBlankSpace({
        parentId: node.id,
        __parentTypename: node.__typename,
        orderingIndex: -0.5,
      }),
    ]

    blankSpaces.push(
      ...sortedItems.map((item, index) =>
        newBlankSpace({
          parentId: node.id,
          __parentTypename: node.__typename,

          orderingIndex: index + 0.5,
        })
      )
    )

    // Add blank spaces to sorted
    sortedItems.push(...blankSpaces)

    // Sort sorted items again by orderingIndex
    sortedItems.sort((a, b) => {
      if (a.orderingIndex < b.orderingIndex) {
        return -1
      }
      if (a.orderingIndex > b.orderingIndex) {
        return 1
      }
      return 0
    })

    const items: Omit<ItemData<NodeItem>, 'id'>[] = []

    // Add sortedItems to items
    sortedItems.forEach((item) => {
      items.push({
        item: item,
        depth: depth,
      })
    })

    // Add each load of nested items directly after its parent (found by parentId)
    nestedItems.forEach((item) => {
      const parent = items.find((i) => i.item.id === item.item.parentId)
      if (parent) {
        items.splice(items.indexOf(parent) + 1, 0, item)
      } else {
        throw `Could not find parent of ${item.item.id} in ${items}`
      }
    })

    return items.map((item, index) => {
      return {
        ...item,
        id: index,
      }
    })
  }

  const handleToggleCollapse = () => {}

  const handleChange = (newItems: ItemData<NodeItem>[]) => {
    console.log('handleChange', newItems)
    if (isLocalWorkspace) {
      // Seperate LocalFolders and LocalRESTRequests
      const localFolders = newItems
        .map((item) => item.item)
        .filter((item) => item.__typename === 'LocalFolder') as LocalFolder[]

      localFoldersVar(localFolders)

      const localRESTRequests = newItems
        .map((item) => item.item)
        .filter(
          (item) => item.__typename === 'LocalRESTRequest'
        ) as LocalRESTRequest[]

      localRESTRequestsVar(localRESTRequests)
    } else {
      throw 'Non local workspaces have not been implemented yet for CollectionTree'
    }
  }

  const items = getNodeChildren({ node: collection })

  console.log('Items are', items)

  return (
    <Box>
      <CollectionTopMenu collection={collection} />
      <Divider />
      <DndProvider backend={HTML5Backend}>
        <SortlyContextProvider>
          <Flipper flipKey={items.map(({ id }) => id).join('.')}>
            <Sortly<NodeItem> items={items} onChange={handleChange}>
              {(props) => (
                <ItemRenderer
                  {...props}
                  onToggleCollapse={handleToggleCollapse}
                />
              )}
            </Sortly>
          </Flipper>
        </SortlyContextProvider>
      </DndProvider>
    </Box>
  )
}
