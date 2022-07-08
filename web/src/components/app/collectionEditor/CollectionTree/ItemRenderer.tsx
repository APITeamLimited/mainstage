import { memo } from 'react'

import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { SvgIcon, Box } from '@mui/material'
import { Flipped } from 'react-flip-toolkit'
import { ID, ItemRendererProps, useDrag, useDrop } from 'web/lib/react-sortly'

import { NodeItem } from './CollectionTree'

type ItemItemRendererProps = ItemRendererProps<NodeItem> & {
  onToggleCollapse: (id: ID) => void
}

const getTypeClassification = (__typename: string) => {
  // Check if __typename is LocalFolder or Folder
  if (__typename === 'LocalFolder') {
    return 'folder'
  } else if (__typename === 'LocalRESTRequest') {
    return 'file'
  } else {
    throw `Unknown type ${__typename}`
  }
}

export const ItemRenderer = memo((props: ItemItemRendererProps) => {
  const { id, data, onToggleCollapse } = props
  const { item, collapsed } = data

  const typeClassification = getTypeClassification(item.__typename)

  const [{ isDragging }, drag] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const [, drop] = useDrop()

  const handleClick = () => {
    onToggleCollapse(id)
  }

  return (
    <Flipped flipId={id}>
      <div ref={(ref) => drag(drop(ref))}>
        <Box onClick={handleClick}>
          {typeClassification === 'folder' && !collapsed && <FolderOpenIcon />}
          {typeClassification === 'folder' && collapsed && <FolderIcon />}
          {typeClassification === 'file' && <InsertDriveFileIcon />}
        </Box>
        <Box display="flex" flex={1} px={1}>
          {item.name}
        </Box>
      </div>
    </Flipped>
  )
})

export default ItemRenderer
