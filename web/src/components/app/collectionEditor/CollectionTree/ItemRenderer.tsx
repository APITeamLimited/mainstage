import { memo } from 'react'

import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Flipped } from 'react-flip-toolkit'
import { ID, ItemRendererProps, useDrag, useDrop } from 'web/lib/react-sortly'
import { useIsClosestDragging } from 'web/lib/react-sortly/useIsClosestDragging'

import { NodeItem } from './CollectionTree'

type ItemItemRendererProps = ItemRendererProps<NodeItem> & {
  onToggleCollapse: (id: ID) => void
}

const useStyles = makeStyles<Theme, ItemItemRendererProps & { muted: boolean }>(
  (theme: Theme) => ({
    root: (props) => ({
      display: 'flex',
      alignItems: 'center',
      fontSize: props.data.type === 'folder' ? 20 : 18,
      position: 'relative',
      cursor: 'move',
      padding:
        props.data.collapsed && props.data.type === 'file'
          ? 0
          : theme.spacing(0.5, 0),
      margin: theme.spacing(0.5),
      marginLeft: theme.spacing(props.depth * 2),
      color: props.muted ? theme.palette.primary.dark : 'inherit',
      zIndex: props.muted ? 1 : 0,
      fontWeight: props.data.type === 'folder' ? 600 : 500,
      height: props.data.collapsed && props.data.type === 'file' ? 0 : 'auto',
      overflow: 'hidden',
    }),
  })
)

export const ItemRenderer = memo((props: ItemItemRendererProps) => {
  const {
    id,
    depth,
    data: { collapsed, item },
    onToggleCollapse,
  } = props

  const theme = useTheme()

  const [dragObject, drag] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      item: monitor,
    }),
    end: (dropResult, monitor) => {
      monitor.getItem()
    },
  })

  const { isDragging } = dragObject
  const draggedItem = dragObject.item
  console.log('dragObject', dragObject)

  const [theDrop, drop] = useDrop()
  const isDropZone = theDrop.hovered as boolean

  const handleClick = () => {
    onToggleCollapse(id)
  }

  console.log('id', id, 'theDrop', theDrop, 'isDragging', isDragging)

  return (
    <Flipped flipId={id}>
      <div ref={(ref) => drag(drop(ref))}>
        <Box
          sx={{
            paddingLeft: depth * 4,
          }}
        >
          {item.__typename === 'BlankSpace' ? (
            <Box
              sx={{
                minHeight: isDropZone ? '2em' : '0.5em',
                backgroundColor: isDropZone
                  ? theme.palette.alternate.dark
                  : 'inherit',
              }}
            />
          ) : (
            <Stack
              direction="row"
              sx={{
                paddingY: 1,
              }}
            >
              <Box onClick={handleClick}>
                {/*typeClassification === 'folder' && !collapsed && (
                  <FolderOpenIcon />
                )}
                {typeClassification === 'folder' && collapsed && <FolderIcon />}
                {typeClassification === 'file' && <InsertDriveFileIcon />*/}
              </Box>
              <Box display="flex" flex={1} px={1}>
                <Typography color={isDragging ? 'blue' : undefined}>
                  {item.name}
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </div>
    </Flipped>
  )
})

export default ItemRenderer
