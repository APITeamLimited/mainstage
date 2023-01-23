import { useState } from 'react'

import {
  ListItem,
  ListItemText,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material'

import { EditNameInput } from './EditNameInput'

type RequestListItemProps = {
  isInFocus: boolean
  onClick: () => void
  primaryText: string
  setPrimaryText?: (primaryText: string) => void
  secondaryText?: string
  icon?: React.ReactNode
  secondaryAction?: React.ReactNode
  renaming?: boolean
  listItemTextSx?: SxProps
  showActionsNotHovered?: boolean
}

export const RequestListItem = ({
  isInFocus,
  onClick,
  primaryText,
  setPrimaryText,
  secondaryText,
  icon,
  renaming,
  secondaryAction,
  listItemTextSx,
  showActionsNotHovered,
}: RequestListItemProps) => {
  const theme = useTheme()

  const [hovered, setHovered] = useState(false)

  return (
    <ListItem
      secondaryAction={
        showActionsNotHovered || hovered ? secondaryAction : null
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        cursor: 'pointer',
        height: '42px',
        paddingY: 0,
      }}
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
        onClick()
      }}
      selected={isInFocus}
    >
      {icon}
      <ListItemText
        primary={
          <EditNameInput
            name={primaryText}
            setNameCallback={setPrimaryText || (() => {})}
            isRenaming={renaming ?? false}
          />
        }
        primaryTypographyProps={{
          variant: 'body1',
          fontWeight: isInFocus ? 'bold' : 'normal',
        }}
        secondary={
          <>
            {!renaming && (
              <Typography
                sx={{
                  position: 'relative',
                  top: '-3px',
                  opacity: 0.6,
                  height: '18px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
                fontSize="0.75rem"
                color={theme.palette.text.secondary}
                variant="body2"
                component="span"
              >
                {secondaryText}
              </Typography>
            )}
          </>
        }
        sx={{
          whiteSpace: 'nowrap',
          marginLeft: renaming ? -1 : -2.5,
          marginRight: renaming ? -1 : 'auto',
          overflow: 'hidden',
          ...listItemTextSx,
        }}
      />
    </ListItem>
  )
}
