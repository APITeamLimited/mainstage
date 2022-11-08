import { useCallback, useEffect, useMemo, useState } from 'react'

import { DocsSearchIndex, FlatContent } from '@apiteam/docs/src'
import SearchIcon from '@mui/icons-material/Search'
import {
  Stack,
  useTheme,
  Paper,
  InputBase,
  Box,
  Typography,
  Divider,
} from '@mui/material'

import { navigate } from '@redwoodjs/router'

import { CustomDialog } from 'src/components/custom-mui'
import { useSimplebarReactModule } from 'src/contexts/imports'
import { useHotkeysModule } from 'src/contexts/imports/hotkeys-module-provider'

import { SearchGroup } from './SearchGroup'
import { SearchKeys } from './SearchKeys'

// Loads previous search results from local storage
const loadPreviousSearches = (namespace: string): FlatContent[] => {
  const previousSearches = localStorage.getItem(`localSearches-${namespace}`)
  if (previousSearches) {
    return JSON.parse(previousSearches)
  }
  return []
}

const minSearchTime = 100

type SearchDialogProps = {
  open: boolean
  onClose: () => void
  searchIndex: DocsSearchIndex
  prompt: string
  namespace: string
}

export const SearchDialog = ({
  open,
  onClose,
  searchIndex,
  prompt,
  namespace,
}: SearchDialogProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()
  const { useHotkeys } = useHotkeysModule()
  const theme = useTheme()

  const [previousSearches, setPreviousSearches] = useState<
    Omit<FlatContent, 'markdown'>[]
  >(loadPreviousSearches(namespace))

  const [searchResults, setSearchResults] = useState<SearchGroup[]>([])
  const [searchBarContent, setSearchBarContent] = useState('')
  const [lastSearchTime, setLastSearchTime] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [maxIndex, setMaxIndex] = useState(0)
  const [recentMode, setRecentMode] = useState(true)

  const recentResults = useMemo(
    () => ({
      name: 'Recent',
      results: previousSearches.map((previousSearch, index) => ({
        ...previousSearch,
        listIndex: index,
      })),
    }),
    [previousSearches]
  )

  const handleNavigate = (searchResult: Omit<FlatContent, 'markdown'>) => {
    // Load previous searches and if result already exists in previous searches, remove it
    const previousSearches = loadPreviousSearches(namespace).filter(
      (previousSearch) => previousSearch.slug !== searchResult.slug
    )

    const newSearches = [
      {
        variant: searchResult.variant,
        title: searchResult.title,
        slug: searchResult.slug,
      },
      ...previousSearches,
    ]
    localStorage.setItem(
      `localSearches-${namespace}`,
      JSON.stringify(newSearches)
    )
    setPreviousSearches(newSearches)

    navigate(searchResult.slug)
    onClose()
  }

  const deletePreviousSearchResult = (previousIndex: number) => {
    const newIndexes = previousSearches.filter(
      (_, index) => index !== previousIndex
    )
    localStorage.setItem(
      `localSearches-${namespace}`,
      JSON.stringify(newIndexes)
    )
    setPreviousSearches(newIndexes)
  }

  const handleSearch = useCallback(() => {
    setLastSearchTime(Date.now())

    const results = searchIndex.search(searchBarContent)

    // Group results by chapter
    const groupedResults: SearchGroup[] = []

    let currentIndex = 0

    results.forEach(({ item }) => {
      const chapterIndex = groupedResults.findIndex(
        (group) => group.name === item.title
      )

      const newItem =
        item.variant === 'page'
          ? {
              variant: item.variant,
              title: item.title,
              slug: item.slug,
              listIndex: currentIndex,
              markdown: '',
              chapter: item.chapter,
            }
          : {
              variant: item.variant,
              title: item.title,
              slug: item.slug,
              listIndex: currentIndex,
              markdown: '',
            }

      currentIndex++

      if (chapterIndex !== -1) {
        groupedResults[chapterIndex].results.push(newItem)
      } else {
        groupedResults.push({
          name: newItem.title,
          results: [newItem],
        })
      }
    })

    setActiveIndex(0)
    setMaxIndex(currentIndex - 1)

    setSearchResults(Object.values(groupedResults))
    setScheduledSearch(false)
  }, [searchIndex, searchBarContent])

  const [scheduledSearch, setScheduledSearch] = useState(false)

  useEffect(() => {
    if (searchBarContent === '') {
      return
    }

    const searchTime = Date.now()

    // Ensure that the search is only performed at most once every minSearchTime
    const elapsedTime = searchTime - lastSearchTime

    if (elapsedTime > minSearchTime) {
      handleSearch()
    } else if (!scheduledSearch) {
      const waitTime = minSearchTime - elapsedTime
      setTimeout(() => {
        handleSearch()
      }, waitTime)
      setScheduledSearch(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSearch, lastSearchTime, searchBarContent])

  useEffect(() => {
    setRecentMode(searchBarContent.length === 0)
  }, [searchBarContent])

  useEffect(() => {
    if (recentMode) {
      setMaxIndex(recentResults.results.length - 1)
      setSearchResults([])
      setActiveIndex(0)
    }
  }, [recentMode, recentResults])

  // on down arrow, go to next result
  useHotkeys(
    'down',
    (event) => {
      if (activeIndex < maxIndex) {
        event.preventDefault()
        setActiveIndex(activeIndex + 1)
      }
    },
    [activeIndex]
  )

  // on up arrow, go to previous result
  useHotkeys(
    'up',
    (event) => {
      if (activeIndex > 0) {
        event.preventDefault()
        setActiveIndex(activeIndex - 1)
      }
    },
    [activeIndex]
  )

  // on enter, navigate to result
  useHotkeys(
    'enter',
    (event) => {
      for (const searchGroup of recentMode ? [recentResults] : searchResults) {
        for (const result of searchGroup.results) {
          if (result.listIndex === activeIndex) {
            event.preventDefault()
            handleNavigate(result)
            onClose()
            return
          }
        }
      }
    },
    [activeIndex]
  )

  useEffect(() => {
    if (!open) {
      setSearchBarContent('')
    }
  }, [open])

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Search"
      fullWidth
      maxWidth="sm"
      disableScrollAndPadding
    >
      <Stack
        spacing={2}
        sx={{
          height: 'calc(100% - 1.5em)',
          maxHeight: 'calc(100% - 1.5em)',
          overflowY: 'hidden',
          overflowX: 'visible',
          marginY: 2,
          paddingX: 2,
          display: 'flex',
        }}
      >
        <Stack
          spacing={4}
          sx={{
            flex: 1,
            maxHeight: '100%',
            overflow: 'hidden',
          }}
        >
          <Paper
            sx={{
              width: '100%',
              // Select text cursor
              cursor: 'text',
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
            }}
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
              <InputBase
                placeholder={prompt}
                value={searchBarContent}
                onKeyDown={(event) => {
                  // Check if down arrow is pressed
                  if (event.key === 'ArrowDown') {
                    if (activeIndex < maxIndex) {
                      event.preventDefault()
                      setActiveIndex(activeIndex + 1)
                    }
                  }

                  // Check if up arrow is pressed
                  if (event.key === 'ArrowUp') {
                    if (activeIndex > 0) {
                      event.preventDefault()
                      setActiveIndex(activeIndex - 1)
                    }
                  }

                  // Check if enter is pressed
                  if (event.key === 'Enter') {
                    for (const searchGroup of recentMode
                      ? [recentResults]
                      : searchResults) {
                      for (const result of searchGroup.results) {
                        if (result.listIndex === activeIndex) {
                          onClose()
                          event.preventDefault()
                          handleNavigate(result)
                        }
                      }
                    }
                  }
                }}
                onChange={(event) => setSearchBarContent(event.target.value)}
                sx={{
                  color: theme.palette.text.primary,
                  flex: 1,
                  // Placeholder text color
                  '&::placeholder': {
                    color: theme.palette.text.secondary,
                  },
                }}
                inputProps={{ 'aria-label': prompt }}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </Stack>
          </Paper>
          <Box
            style={{
              maxWidth: '100%',
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
            }}
          >
            <SimpleBar
              style={{
                height: '100%',
                maxHeight: '100%',
              }}
            >
              <Stack spacing={4}>
                {searchBarContent !== '' ? (
                  searchResults.map((group, index) => (
                    <SearchGroup
                      key={index}
                      group={group}
                      onNavigate={handleNavigate}
                      activeIndex={activeIndex}
                      setActiveIndex={setActiveIndex}
                    />
                  ))
                ) : (
                  <SearchGroup
                    group={recentResults}
                    onNavigate={handleNavigate}
                    deletePreviousSearchResult={deletePreviousSearchResult}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    previous
                  />
                )}
              </Stack>
            </SimpleBar>
          </Box>
        </Stack>
        <Box
          sx={{
            minHeight: '45.75px',
            // PRevent the search bar from shrinking
            flexShrink: 0,
          }}
        >
          <Divider />
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              paddingTop: 3,
              paddingBottom: 1,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <SearchKeys keys={['↵']} />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.grey[500],
                  fontWeight: 'bold',
                  userSelect: 'none',
                }}
              >
                to select
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SearchKeys keys={['↓']} />
              <SearchKeys keys={['↑']} />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.grey[500],
                  fontWeight: 'bold',
                  userSelect: 'none',
                }}
              >
                to navigate
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SearchKeys keys={['esc']} />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.grey[500],
                  fontWeight: 'bold',
                  userSelect: 'none',
                }}
              >
                to close
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </CustomDialog>
  )
}
