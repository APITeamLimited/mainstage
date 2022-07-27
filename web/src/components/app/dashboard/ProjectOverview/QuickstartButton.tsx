import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone'
import { Button } from '@mui/material'

import { LocalProject } from 'src/contexts/reactives'

import { quickstartDialogStateVar } from '../../dialogs/QuickstartDialog'

type QuickstartButtonProps = {
  minWidth: number
  project: LocalProject
}

export const QuickstartButton = ({
  minWidth = 120,
  project,
}: QuickstartButtonProps) => {
  const handleClick = () => {
    quickstartDialogStateVar({
      isOpen: true,
      project: project,
    })
  }

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        sx={{
          minHeight: 150,
          minWidth: minWidth,
          borderStyle: 'dashed',
        }}
        onClick={handleClick}
      >
        <AddCircleOutlineTwoToneIcon sx={{ fontSize: 60 }} />
      </Button>
    </>
  )
}
