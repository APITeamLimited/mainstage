/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReactiveVar } from '@apollo/client'
import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone'
import { Button, Tooltip } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { activeWorkspaceIdVar } from 'src/contexts/reactives'

import { quickstartDialogStateVar } from '../../dialogs/QuickstartDialog'

type QuickstartButtonProps = {
  minWidth?: number
  projectYMap: YMap<any>
}

export const QuickstartButton = ({
  minWidth = 130,
  projectYMap,
}: QuickstartButtonProps) => {
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const handleClick = () => {
    quickstartDialogStateVar({
      isOpen: true,
      project: {
        id: projectYMap.get('id'),
        name: projectYMap.get('name'),
        createdAt: new Date(projectYMap.get('createdAt')),
        updatedAt: projectYMap.get('updatedAt')
          ? new Date(projectYMap.get('updatedAt'))
          : null,
        __typename: 'Project',
        __parentTypename: 'Workspace',
        parentId: activeWorkspaceId as string,
      },
    })
  }

  return (
    <Tooltip title="Quickstart">
      <Button
        variant="outlined"
        sx={{
          minHeight: 150,
          minWidth: minWidth,
          borderStyle: 'dashed',
        }}
        onClick={handleClick}
      >
        <AddCircleOutlineTwoToneIcon sx={{ fontSize: 60 }} />
      </Button>
    </Tooltip>
  )
}
