import { FlatContent } from '../packages/docs/src'
import ClearIcon from '@mui/icons-material/Clear'
import HistoryIcon from '@mui/icons-material/History'
import TagIcon from '@mui/icons-material/Tag'
import {
  Card,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SvgIcon,
  Tooltip,
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
        paddingY: 3,

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
      <ListItem
        sx={{
          padding: 0,
        }}
      >
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
        {previous && activeIndex === result.listIndex ? (
          <Tooltip title="Delete">
            <IconButton
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                onDelete?.()
              }}
            >
              <ClearIcon
                sx={{
                  color: theme.palette.background.paper,
                  height: '24px',
                  width: '24px',
                }}
              />
            </IconButton>
          </Tooltip>
        ) : (
          // Maintain the same height as the IconButton above
          <div
            style={{
              height: '34px',
            }}
          />
        )}
      </ListItem>
    </Card>
  )
}
