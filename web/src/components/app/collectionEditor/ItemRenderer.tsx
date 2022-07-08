import { memo } from 'react'

import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { SvgIcon, Box } from '@mui/material'
import { Flipped } from 'react-flip-toolkit'
import { ID, ItemRendererProps, useDrag, useDrop } from 'react-sortly'

type ItemItemRendererProps = ItemRendererProps<{
  name: string
  type: 'folder' | 'file'
  collapsed?: boolean
}> & {
  onToggleCollapse: (id: ID) => void
}

export const ItemRenderer = memo((props: ItemItemRendererProps) => {
  const {
    id,
    depth,
    data: { type, collapsed, name },
    onToggleCollapse,
  } = props
  const [{ isDragging }, drag] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const [, drop] = useDrop()

  const handleClick = () => {
    if (type === 'file') {
      return
    }

    onToggleCollapse(id)
  }

  return (
    <Flipped flipId={id}>
      <div ref={(ref) => drag(drop(ref))}>
        <Box onClick={handleClick}>
          {type === 'folder' && !collapsed && (
            <SvgIcon component={FolderOpenIcon} />
          )}
          {type === 'folder' && collapsed && <SvgIcon component={FolderIcon} />}
          {type === 'file' && <SvgIcon component={InsertDriveFileIcon} />}
        </Box>
        <Box display="flex" flex={1} px={1}>
          {name}
        </Box>
      </div>
    </Flipped>
  )
})

export default ItemRenderer
