import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone'
import { Button, Grid } from '@mui/material'

import {
  GRAPH_HEIGHT,
  GRAPH_SPACING_XS,
  GRAPH_SPACING_LG,
  GRAPH_SPACING_XL,
} from '.'

type AddGraphButtonProps = {
  onOpenCreateDialog: () => void
}

export const AddGraphButton = ({ onOpenCreateDialog }: AddGraphButtonProps) => {
  return (
    <Grid
      item
      xs={GRAPH_SPACING_XS}
      lg={GRAPH_SPACING_LG}
      xl={GRAPH_SPACING_XL}
    >
      <Button
        color="primary"
        variant="outlined"
        onClick={onOpenCreateDialog}
        endIcon={<AddCircleOutlineTwoToneIcon />}
        sx={{
          height: GRAPH_HEIGHT,
          margin: 0,
          width: '100%',
          borderStyle: 'dashed',
        }}
      >
        Add Graph
      </Button>
    </Grid>
  )
}
