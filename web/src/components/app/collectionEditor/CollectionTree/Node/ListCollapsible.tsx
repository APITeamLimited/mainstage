import { Box, Collapse, List, Typography, useTheme } from '@mui/material'

import { DropSpace } from './Node'

type ListCollapsibleProps = {
  collapsed: boolean
  hovered: boolean
  dropSpace: DropSpace
  innerContent: JSX.Element[]
}

export const ListCollapsible = ({
  collapsed,
  hovered,
  dropSpace,
  innerContent,
}: ListCollapsibleProps) => {
  const theme = useTheme()

  return (
    <Collapse in={!collapsed || hovered} timeout="auto">
      <List
        sx={{
          marginLeft: 4,
          paddingTop: 0,
          paddingBottom: dropSpace === 'Bottom' ? 0.5 : 1,
        }}
      >
        {innerContent.length > 0 ? (
          innerContent
        ) : (
          <Box
            sx={{
              paddingY: 1,
              paddingLeft: 1,
              backgroundColor:
                dropSpace === 'Inner' && hovered
                  ? theme.palette.primary.light
                  : theme.palette.background.default,
            }}
          >
            <Typography
              color={theme.palette.text.secondary}
              fontSize="small"
              sx={{
                opacity: dropSpace === 'Inner' && hovered ? 0 : 1,
              }}
            >
              This folder is empty
            </Typography>
          </Box>
        )}
      </List>
    </Collapse>
  )
}
