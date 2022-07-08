import { useRef, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  Stack,
} from '@mui/material'

import { LocalCollection } from 'src/contexts/reactives'

import { NewItemPopover } from './NewItemPopover'

type CollectionTopMenuProps = {
  collection: LocalCollection
}

export const CollectionTopMenu = ({ collection }: CollectionTopMenuProps) => {
  const theme = useTheme()
  const newItemButtonRef = useRef<HTMLButtonElement | null>(null)
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false)

  const handleNewItemButtonOpen = () => setNewItemPopoverOpen(true)
  const handleNewItemButtonClose = () => setNewItemPopoverOpen(false)

  return (
    <>
      <Box
        sx={{
          margin: 1,
        }}
      >
        <Stack
          justifyContent="space-between"
          direction="row"
          alignItems="center"
          sx={{
            paddingLeft: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              whiteSpace: 'nowrap',
            }}
            color={theme.palette.text.primary}
          >
            {collection.name}
          </Typography>
          <IconButton aria-label="Collection Settings">
            <MoreVertIcon />
          </IconButton>
        </Stack>
        <Typography
          variant="body2"
          color={theme.palette.text.secondary}
          sx={{
            paddingLeft: 1,
          }}
        >
          Environment
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            padding: 1,
          }}
          spacing={1}
        >
          <Button size="small" variant="outlined" color="secondary">
            Dev
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            ref={newItemButtonRef}
            onClick={handleNewItemButtonOpen}
          >
            <AddIcon />
          </Button>
        </Stack>
      </Box>
      <NewItemPopover
        anchorEl={newItemButtonRef.current}
        collection={collection}
        open={newItemPopoverOpen}
        onClose={handleNewItemButtonClose}
      />
    </>
  )
}
