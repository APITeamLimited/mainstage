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
  icon?: React.ElementType
  iconNode?: React.ReactNode
  tooltip?: string
  onClick?: () => void
  text?: string
}

export const StatusBarItem = ({
  icon,
  iconNode,
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
          height: STATUS_BAR_HEIGHT - 1,
          maxHeight: STATUS_BAR_HEIGHT - 1,
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
                width: STATUS_BAR_HEIGHT - 4,
                height: STATUS_BAR_HEIGHT - 4,
                color: theme.palette.text.primary,
              }}
              component={icon}
            />
          )}
          {iconNode && (
            <SvgIcon
              sx={{
                width: STATUS_BAR_HEIGHT - 4,
                height: STATUS_BAR_HEIGHT - 4,
                color: theme.palette.text.primary,
              }}
            >
              {iconNode}
            </SvgIcon>
          )}
          {text && (
            <Typography
              variant="caption"
              color={theme.palette.text.primary}
              sx={{
                paddingTop: '2px',
              }}
            >
              {text}
            </Typography>
          )}
        </Stack>
      </MenuItem>
    ),
    [onClick, icon, theme.palette.text.primary, iconNode, text]
  )

  return tooltip ? (
    <Tooltip title={tooltip} placement="top">
      {statusBar}
    </Tooltip>
  ) : (
    statusBar
  )
}
