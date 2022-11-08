import { FlatContent } from '@apiteam/docs/src'
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

import { useLocation } from '@redwoodjs/router'

type SearchItemProps = {
  result: Omit<FlatContent, 'markdown'> & {
    listIndex: number
  }
  activeIndex: number
  onClick: () => void
  previous?: boolean
  onDelete?: () => void
  onSetActive: () => void
}

export const SearchItem = ({
  result,
  onClick,
  previous,
  onDelete,
  onSetActive,
  activeIndex,
}: SearchItemProps) => {
  const theme = useTheme()
  const { pathname } = useLocation()

  return (
    <Card
      onMouseEnter={onSetActive}
      component={MenuItem}
      sx={{
        padding: 2,
        width: '100%',
        backgroundColor:
          activeIndex === result.listIndex
            ? theme.palette.primary.main
            : theme.palette.background.paper,

        // Ripple effect
        '.MuiTouchRipple-child': {
          backgroundColor:
            activeIndex === result.listIndex
              ? theme.palette.primary.dark
              : theme.palette.primary.main,
        },

        // Hover effect
        '&:hover': {
          backgroundColor:
            activeIndex === result.listIndex
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
              color:
                activeIndex === result.listIndex
                  ? theme.palette.background.paper
                  : theme.palette.primary.main,
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={`${result.title}${pathname === result.slug ? ' 👈' : ''}`}
          primaryTypographyProps={{
            sx: {
              color:
                activeIndex === result.listIndex
                  ? theme.palette.background.paper
                  : theme.palette.text.primary,
            },
          }}
        />
      </ListItem>
    </Card>
  )
}
