import ErrorIcon from '@mui/icons-material/Error'
import { useTheme, Paper } from '@mui/material'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'

export const ErrorPanel = () => {
  const theme = useTheme()

  return (
    <Paper sx={{ height: '100%', width: '100%' }} elevation={0}>
      <EmptyPanelMessage
        primaryText="Error"
        secondaryMessages={[
          'An error occurred while trying to load this section,',
        ]}
        icon={
          <ErrorIcon
            sx={{
              marginBottom: 2,
              width: 80,
              height: 80,
              color: theme.palette.error.main,
            }}
          />
        }
      />
    </Paper>
  )
}
