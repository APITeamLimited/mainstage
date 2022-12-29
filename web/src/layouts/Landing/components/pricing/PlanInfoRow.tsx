import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {
  Grid,
  Box,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  useTheme,
} from '@mui/material'

type PlanInfoRowProps = {
  text: string
  icon?: 'tick' | 'cross'
}

export const PlanInfoRow = ({ text, icon = 'tick' }: PlanInfoRowProps) => {
  const theme = useTheme()

  return (
    <Grid item xs={12}>
      <Box component={ListItem} disableGutters width={'auto'} padding={0}>
        <Box
          component={ListItemAvatar}
          minWidth={'auto !important'}
          marginRight={2}
        >
          <Box
            component={Avatar}
            bgcolor={theme.palette.background.paper}
            width={20}
            height={20}
          >
            {icon === 'tick' ? (
              <CheckCircleIcon
                sx={{
                  width: 18,
                  height: 18,
                  color: theme.palette.primary.main,
                }}
              />
            ) : (
              <CancelIcon
                sx={{
                  width: 18,
                  height: 18,
                  color: theme.palette.error.main,
                }}
              />
            )}
          </Box>
        </Box>
        <ListItemText primary={text} />
      </Box>
    </Grid>
  )
}
