import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  useTheme,
  Typography,
  Box,
} from '@mui/material'

import { SearchResult } from './Search'
import { SearchItem } from './SearchItem'

export type SearchGroup = {
  name: string
  results: SearchResult[]
}

type SearchGroupProps = {
  group: SearchGroup
  onNavigate: (result: SearchResult) => void
  deletePreviousSearchResult?: (previousIndex: number) => void
  previous?: boolean
}

export const SearchGroup = ({
  group,
  onNavigate,
  deletePreviousSearchResult,
  previous,
}: SearchGroupProps) => {
  const theme = useTheme()

  return (
    <Stack key={group.name} spacing={2}>
      <Typography
        variant="h6"
        fontWeight="bold"
        color={theme.palette.primary.main}
        sx={{
          userSelect: 'none',
        }}
      >
        {group.name}
      </Typography>
      {group.results.length > 0 ? (
        <Stack spacing={1}>
          {group.results.map((result, index) => (
            <SearchItem
              key={index}
              result={result}
              onClick={() => onNavigate(result)}
              previous={previous}
              onDelete={() => deletePreviousSearchResult?.(index)}
            />
          ))}
        </Stack>
      ) : previous ? (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100px',
          }}
        >
          <Typography
            variant="body1"
            color={theme.palette.text.secondary}
            sx={{
              userSelect: 'none',
            }}
          >
            No recent searches
          </Typography>
        </Box>
      ) : (
        <></>
      )}
    </Stack>
  )
}
