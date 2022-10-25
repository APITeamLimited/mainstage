import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone'
import { Button, Grid } from '@mui/material'

import {
  GRAPH_HEIGHT,
  GRAPH_SPACING_XS,
  GRAPH_SPACING_LG,
  GRAPH_SPACING_XL,
} from '.'

type AddGraphButtonProps = {
  onOpenMenu: () => void
}

export const AddGraphButton = ({ onOpenMenu }: AddGraphButtonProps) => {
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
        onClick={onOpenMenu}
        sx={{
          height: GRAPH_HEIGHT,
          margin: 0,
          width: '100%',
        }}
      >
        <AddCircleOutlineTwoToneIcon sx={{ fontSize: 60 }} />
        Add Graph
      </Button>
    </Grid>
  )
}
