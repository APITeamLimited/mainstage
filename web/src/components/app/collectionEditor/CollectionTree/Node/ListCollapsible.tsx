import { Box, Collapse, Stack, List, Typography, useTheme } from '@mui/material'

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
          marginLeft: 2,
          paddingTop: 0,
          paddingBottom: 0, //dropSpace === 'Bottom' ? 0 : 1,
        }}
      >
        {innerContent.length > 0 ? (
          innerContent
        ) : (
          <Box
            sx={{
              backgroundColor:
                dropSpace === 'Inner' && hovered
                  ? theme.palette.primary.light
                  : theme.palette.background.default,
            }}
          >
            <Stack
              sx={{
                height: '48px',
                justifyContent: 'center',
                alignItems: 'center',
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
            </Stack>
          </Box>
        )}
      </List>
    </Collapse>
  )
}
