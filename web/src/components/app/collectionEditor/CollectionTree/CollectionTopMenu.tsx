import { useState } from 'react'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

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
import { useYMap } from 'zustand-yjs'

import {
  useActiveEnvironment,
  useActiveEnvironmentYMap,
} from 'src/contexts/EnvironmentProvider'

import { EnvironmentManager } from '../../EnvironmentManager'
type CollectionTopMenuProps = {
  collectionYMap: Y.Map<any>
}

export const CollectionTopMenu = ({
  collectionYMap,
}: CollectionTopMenuProps) => {
  const theme = useTheme()
  const branchYMap = collectionYMap?.parent?.parent
  //const branch = useYMap(branchYMap)
  const projectYMap = branchYMap?.parent?.parent
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const [showEnvironmentManager, setShowEnvironmentManager] = useState(false)

  const collection = useYMap(collectionYMap)

  const isActiveEnvironment = activeEnvironmentYMap?.get('id')

  if (!projectYMap) {
    throw `Could not find project with id ${projectYMap?.get(
      'id'
    )} for collectionYMap ${collectionYMap?.get('id')}`
  }

  return (
    <>
      <EnvironmentManager
        projectYMap={projectYMap}
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
            {collection.data.name}
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
          {isActiveEnvironment ? activeEnvironmentYMap.get('name') : 'None'}
        </Button>
      </Box>
    </>
  )
}
