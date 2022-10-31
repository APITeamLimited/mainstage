import { useMemo } from 'react'

import {
  MenuItem,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'

import { STATUS_BAR_HEIGHT } from './StatusBar'

type StatusBarItemProps = {
  icon: React.ElementType
  tooltip?: string
  onClick?: () => void
  text?: string
}

export const StatusBarItem = ({
  icon,
  tooltip,
  onClick,
  text,
}: StatusBarItemProps) => {
  const theme = useTheme()

  const statusBar = useMemo(
    () => (
      <MenuItem
        sx={{
          paddingY: 0,
          paddingX: 1,
          margin: 0,
          height: STATUS_BAR_HEIGHT,
          maxHeight: STATUS_BAR_HEIGHT,
          cursor: onClick ? 'pointer' : 'default',
        }}
        disableRipple={!onClick}
        disableTouchRipple={!onClick}
        onClick={onClick}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon && (
            <SvgIcon
              sx={{
                width: STATUS_BAR_HEIGHT - 3,
                height: STATUS_BAR_HEIGHT - 3,
                color: theme.palette.text.primary,
              }}
              component={icon}
            />
          )}
          {text && (
            <Typography variant="caption" color={theme.palette.text.primary}>
              {text}
            </Typography>
          )}
        </Stack>
      </MenuItem>
    ),
    [icon, text, theme, onClick]
  )

  return tooltip ? (
    <Tooltip title={tooltip} placement="top">
      {statusBar}
    </Tooltip>
  ) : (
    statusBar
  )
}
