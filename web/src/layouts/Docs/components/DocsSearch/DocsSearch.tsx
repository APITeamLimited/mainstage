import { useState } from 'react'

import type { DocsSearchIndex } from '@apiteam/docs/src'
import DocsSearchIcon from '@mui/icons-material/Search'
import {
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material'

import { SimplebarReactModuleProvider } from 'src/contexts/imports'
import { useDocsSearchIndex } from 'src/contexts/imports/docs-content-provider'
import {
  HotkeysModuleProvider,
  useHotkeysModule,
} from 'src/contexts/imports/hotkeys-module-provider'

import { SearchDialog } from './SearchDialog'
import { SearchKeys } from './SearchKeys'

export type IndexableType = DocsSearchIndex

type DocsSearchProps = {
  searchIndex: DocsSearchIndex
  prompt?: string
  namespace?: string
}

export const DocsSearch = (props: Omit<DocsSearchProps, 'searchIndex'>) => {
  const docsSearchIndex = useDocsSearchIndex()

  return (
    <SimplebarReactModuleProvider>
      <HotkeysModuleProvider>
        <DocsSearchInner
          {...{
            ...props,
            searchIndex: docsSearchIndex,
          }}
        />
      </HotkeysModuleProvider>
    </SimplebarReactModuleProvider>
  )
}

const DocsSearchInner = ({
  searchIndex,
  prompt = 'Search Docs',
  namespace = 'docs',
}: DocsSearchProps) => {
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
            spacing={2}
            sx={{
              paddingX: 2,
              paddingY: 1,
              cursor: 'inherit',
            }}
          >
            <DocsSearchIcon
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
