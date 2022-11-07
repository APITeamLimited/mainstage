import { useState } from 'react'

import HistoryIcon from '@mui/icons-material/History'
import TagIcon from '@mui/icons-material/Tag'
import {
  Card,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SvgIcon,
  useTheme,
} from '@mui/material'

import { SearchResult } from './Search'

type SearchItemProps = {
  result: SearchResult
  onClick: () => void
  previous?: boolean
  onDelete?: () => void
}

export const SearchItem = ({
  result,
  onClick,
  previous,
  onDelete,
}: SearchItemProps) => {
  const theme = useTheme()

  const [hovered, setHovered] = useState(false)

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      component={MenuItem}
      sx={{
        padding: 2,
        width: '100%',
        backgroundColor: hovered
          ? theme.palette.primary.main
          : theme.palette.background.paper,

        // Ripple effect
        '.MuiTouchRipple-child': {
          backgroundColor: hovered
            ? theme.palette.primary.dark
            : theme.palette.primary.main,
        },

        // Hover effect
        '&:hover': {
          backgroundColor: hovered
            ? theme.palette.primary.main
            : theme.palette.background.paper,
        },
      }}
      onClick={onClick}
    >
      <ListItem>
        <ListItemIcon>
          <SvgIcon
            component={previous ? HistoryIcon : TagIcon}
            sx={{
              color: hovered
                ? theme.palette.background.paper
                : theme.palette.primary.main,
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={result.name}
          secondary={result.category}
          primaryTypographyProps={{
            sx: {
              color: hovered
                ? theme.palette.background.paper
                : theme.palette.text.primary,
            },
          }}
          secondaryTypographyProps={{
            sx: {
              color: hovered
                ? theme.palette.background.paper
                : theme.palette.text.secondary,
            },
          }}
        />
      </ListItem>
    </Card>
  )
}
