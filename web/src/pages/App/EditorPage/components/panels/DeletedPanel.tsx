import DeleteIcon from '@mui/icons-material/Delete'
import { useTheme, Paper } from '@mui/material'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'

export const DeletedPanel = () => {
  const theme = useTheme()

  return (
    <Paper sx={{ height: '100%', width: '100%' }} elevation={0}>
      <EmptyPanelMessage
        primaryText="Item Deleted"
        secondaryMessages={['This item has been deleted']}
        icon={
          <DeleteIcon
            sx={{
              marginBottom: 2,
              width: 80,
              height: 80,
              color: theme.palette.action.disabled,
            }}
          />
        }
      />
    </Paper>
  )
}
