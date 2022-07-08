import { useReactiveVar } from '@apollo/client'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Button,
  Paper,
  Typography,
  Box,
  Stack,
  IconButton,
  useTheme,
  SvgIcon,
} from '@mui/material'

import { routes, navigate } from '@redwoodjs/router'

import { activeWorkspaceVar } from 'src/contexts/reactives'

import { OverviewType } from './ProjectOverview'

type OverviewItemProps = {
  item: OverviewType
}

export function OverviewItem({ item }: OverviewItemProps) {
  const theme = useTheme()
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)

  const getTypeName = () => {
    if (item.__typename === 'LocalCollection') {
      return 'Collection'
    } else if (item.__typename === 'LocalProject') {
      return 'Project'
    } else {
      throw `Unknown type: ${item.__typename}`
    }
  }

  const displayType = getTypeName()

  const handleCollectionNavigation = (collectionId: string) =>
    // Navigate to the collection editor page
    navigate(
      routes.collectionEditor({ collectionId, workspaceId: activeWorkspace.id })
    )

  return (
    <Paper
      elevation={2}
      sx={{
        marginRight: 2,
        marginBottom: 2,
        minWidth: 130,
        minHeight: 150,
      }}
    >
      <Button
        sx={{
          width: '100%',
          height: '100%',
          padding: 0,
        }}
        onClick={() => handleCollectionNavigation(item.id)}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          <Stack
            spacing={2}
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{
              height: '100%',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              width="100%"
            >
              <Box
                sx={{
                  marginLeft: 2,
                  marginTop: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                  }}
                >
                  {displayType}
                </Typography>
              </Box>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Stack>
            <Box
              sx={{
                paddingBottom: 2,
                paddingLeft: 2,
                paddingRight: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  textTransform: 'none',
                  color: theme.palette.text.primary,
                }}
              >
                {item.name}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Button>
    </Paper>
  )
}
