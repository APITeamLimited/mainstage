import { Box, Collapse, Stack, List, Typography, useTheme } from '@mui/material'

import { DropSpaceType } from './Node'

type ListCollapsibleProps = {
  collapsed: boolean
  hovered: boolean
  dropSpace: DropSpaceType
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
    <Collapse in={!collapsed || hovered} timeout={100}>
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
                justifyContent: 'center',
                alignItems: 'left',
              }}
            >
              <Typography
                color={theme.palette.text.secondary}
                fontSize="small"
                sx={{
                  opacity: dropSpace === 'Inner' && hovered ? 0 : 1,
                  margin: 1,
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
