import { useReactiveVar } from '@apollo/client'
import { Box, Paper } from '@mui/material'
import { Flipper } from 'react-flip-toolkit'
import Sortly, { ID, ItemData, findDescendants } from 'react-sortly'

import {
  LocalCollection,
  LocalFolder,
  localFoldersVar,
  LocalRESTRequest,
  localRESTRequestsVar,
} from 'src/contexts/reactives'

import { ItemRenderer } from './ItemRenderer'

type CollectionTreeProps = {
  collection: LocalCollection
}

type NodeChild = LocalFolder | LocalCollection | LocalRESTRequest

export const CollectionTree = ({ collection }: CollectionTreeProps) => {
  const localFolders = useReactiveVar(localFoldersVar)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)

  const getItems = (node: LocalCollection | LocalFolder): NodeChild[] => {
    const folders = localFolders.filter((folder) => folder.parentId === node.id)
    const restRequests = localRESTRequests.filter(
      (restRequest) => restRequest.parentId === node.id
    )
    return [...folders, ...restRequests]
  }

  const handleToggleCollapse = () => {}

  const handleChange = (newItems: NodeChild[]) => {}

  const items = getNodeChildren(collection)

  return (
    <Box width={{ md: 600 }}>
      <Paper>
        <Box p={2}>
          <Flipper flipKey={items.map(({ id }) => id).join('.')}>
            <Sortly<NodeChild> items={items} onChange={handleChange}>
              {(props) => (
                <ItemRenderer
                  {...props}
                  onToggleCollapse={handleToggleCollapse}
                />
              )}
            </Sortly>
          </Flipper>
        </Box>
      </Paper>
    </Box>
  )
}
