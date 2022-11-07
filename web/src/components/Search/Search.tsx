import { useState } from 'react'

import { DocsSearchIndex } from '@apiteam/docs/src'
import SearchIcon from '@mui/icons-material/Search'
import {
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material'
import type Fuse from 'fuse.js'

import {
  HotkeysModuleProvider,
  useHotkeysModule,
} from 'src/contexts/imports/hotkeys-module-provider'

import { SearchDialog } from './SearchDialog'
import { SearchKeys } from './SearchKeys'

export type IndexableType = DocsSearchIndex

export type SearchResult = {
  name: string
  category?: string
  path: string
}

type SearchProps<IndexedType> = {
  searchIndex: IndexedType
  prompt?: string
  namespace: string
}

export const Search = <IndexedType extends IndexableType>(
  props: SearchProps<IndexedType>
) => (
  <HotkeysModuleProvider>
    <SearchInner {...props} />
  </HotkeysModuleProvider>
)

const SearchInner = <IndexedType extends IndexableType>({
  searchIndex,
  prompt = 'Search',
  namespace,
}: SearchProps<IndexedType>) => {
  const { useHotkeys } = useHotkeysModule()

  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [isActive, setIsActive] = useState(false)

  // On ctrl + f, set isActive to true
  useHotkeys('ctrl+k', (event) => {
    event.preventDefault()
    setIsActive(true)
  })

  return (
    <>
      <SearchDialog
        open={isActive}
        onClose={() => setIsActive(false)}
        searchIndex={searchIndex}
        prompt={prompt}
        namespace={namespace}
      />
      <Tooltip title={prompt} placement="bottom">
        <Paper
          sx={{
            width: isSmall ? undefined : 400,
            cursor: 'pointer',
            backgroundColor:
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
          }}
          onClick={() => setIsActive(true)}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              paddingX: 2,
              paddingY: 1,
              cursor: 'inherit',
            }}
          >
            <SearchIcon
              sx={{
                color: theme.palette.text.primary,
              }}
            />
            {!isSmall && (
              <Typography
                variant="body2"
                sx={{
                  cursor: 'inherit',
                  userSelect: 'none',
                  color: theme.palette.grey[500],
                  flex: 1,
                }}
              >
                {prompt}
              </Typography>
            )}
            <SearchKeys keys={['ctrl', 'k']} />
          </Stack>
        </Paper>
      </Tooltip>
    </>
  )
}
