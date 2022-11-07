import { useCallback, useEffect, useMemo, useState } from 'react'

import SearchIcon from '@mui/icons-material/Search'
import { Stack, useTheme, Paper, InputBase } from '@mui/material'
import type Fuse from 'fuse.js'

import { CustomDialog } from '../custom-mui'

import { SearchResult } from './Search'
import { SearchGroup } from './SearchGroup'

// Loads previous search results from local storage
const loadPreviousSearches = (namespace: string): SearchResult[] => {
  const previousSearches = localStorage.getItem(namespace)
  if (previousSearches) {
    return JSON.parse(previousSearches)
  }
  return []
}

const minSearchTime = 100

type SearchDialogProps<IndexedType> = {
  open: boolean
  onClose: () => void
  searchIndex: Fuse<IndexedType>
  prompt: string
  namespace: string
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const SearchDialog = <IndexedType extends unknown>({
  open,
  onClose,
  searchIndex,
  prompt,
  namespace,
}: SearchDialogProps<IndexedType>) => {
  const theme = useTheme()

  const [previousSearches, setPreviousSearches] = useState<SearchResult[]>(
    loadPreviousSearches(namespace)
  )

  const handleNavigate = (searchResult: SearchResult) => {
    // Load previous searches and if result already exists in previous searches, remove it
    const previousSearches = loadPreviousSearches(
      `localSearches-${namespace}`
    ).filter((previousSearch) => previousSearch.path !== searchResult.path)

    const newSearches = [searchResult, ...previousSearches]
    localStorage.setItem(
      `localSearches-${namespace}`,
      JSON.stringify(newSearches)
    )
    setPreviousSearches(newSearches)
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

  const recentResults = useMemo(
    () => ({
      name: 'Recent',
      results: previousSearches,
    }),
    [previousSearches]
  )

  const [searchResults, setSearchResults] = useState<SearchGroup[]>([])

  const [searchBarContent, setSearchBarContent] = useState('')

  const [lastSearchTime, setLastSearchTime] = useState(0)

  const handleSearch = useCallback(() => {
    setLastSearchTime(Date.now())
    setScheduledSearch(false)

    const results = searchIndex.search(searchBarContent)

    console.log(results)
  }, [searchIndex, searchBarContent])

  const [scheduledSearch, setScheduledSearch] = useState(false)

  useEffect(() => {
    if (searchBarContent === '') {
      setSearchResults([])
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
    >
      <Stack spacing={4}>
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
        {searchBarContent !== '' ? (
          searchResults.map((group, index) => (
            <SearchGroup
              key={index}
              group={group}
              onNavigate={handleNavigate}
            />
          ))
        ) : (
          <SearchGroup
            group={recentResults}
            onNavigate={handleNavigate}
            deletePreviousSearchResult={deletePreviousSearchResult}
            previous
          />
        )}
      </Stack>
    </CustomDialog>
  )
}
