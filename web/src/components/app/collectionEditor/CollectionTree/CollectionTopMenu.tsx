import { useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  Stack,
} from '@mui/material'

import {
  activeEnvironmentVar,
  LocalCollection,
  localEnvironmentsVar,
  localProjectsVar,
} from 'src/contexts/reactives'

import { EnvironmentManager } from '../../EnvironmentManager'

type CollectionTopMenuProps = {
  collection: LocalCollection
}

export const CollectionTopMenu = ({ collection }: CollectionTopMenuProps) => {
  const theme = useTheme()
  const [showEnvironmentManager, setShowEnvironmentManager] = useState(false)
  const localProjects = useReactiveVar(localProjectsVar)
  const localEnvironments = useReactiveVar(localEnvironmentsVar)
  const activeEnvironmentId = useReactiveVar(activeEnvironmentVar)

  const activeEnvironment =
    localEnvironments.find((env) => env.id === activeEnvironmentId) || null

  if (activeEnvironmentId && !activeEnvironment) {
    throw `Could not find active environment with id ${activeEnvironmentId}`
  }

  const project = localProjects.find(
    (project) => project.id === collection.parentId
  )

  if (!project) {
    throw `Could not find project with id ${collection.parentId} for collection ${collection.id}`
  }

  return (
    <>
      <EnvironmentManager
        project={project}
        show={showEnvironmentManager}
        setShowCallback={setShowEnvironmentManager}
      />
      <Box
        sx={{
          margin: 1,
          paddingLeft: 1,
          marginBottom: 2,
        }}
      >
        <Stack
          justifyContent="space-between"
          direction="row"
          alignItems="center"
          sx={{
            marginBottom: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              whiteSpace: 'nowrap',
            }}
            color={theme.palette.text.primary}
          >
            {collection.name}
          </Typography>
          <IconButton aria-label="Collection Settings">
            <MoreVertIcon />
          </IconButton>
        </Stack>
        <Typography variant="body2" color={theme.palette.text.secondary}>
          Environment:
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => setShowEnvironmentManager(true)}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            marginTop: 1,
          }}
        >
          {activeEnvironment ? activeEnvironment.name : 'None'}
        </Button>
      </Box>
    </>
  )
}
