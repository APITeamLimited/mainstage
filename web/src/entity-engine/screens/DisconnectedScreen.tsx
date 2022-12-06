import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useTheme, Box, Typography, Stack, Button } from '@mui/material'

type DisconnectedScreenProps = {
  show: boolean
  children?: React.ReactNode
}

export const DisconnectedScreen = ({
  show,
  children,
}: DisconnectedScreenProps) => {
  const theme = useTheme()

  return show ? (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        zIndex: 10000000,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Stack
        spacing={4}
        alignItems="center"
        sx={{
          padding: 4,
        }}
      >
        <WarningAmberIcon
          sx={{
            height: '100px',
            width: '100px',
            color: theme.palette.warning.main,
          }}
        />
        <Typography
          variant="h6"
          color={theme.palette.text.secondary}
          sx={{
            textAlign: 'center',
          }}
        >
          You have been disconnected, we will try to reconnect you in a few
          seconds if an internet connection is detected.
        </Typography>
        <Typography
          variant="h6"
          color={theme.palette.text.secondary}
          sx={{
            textAlign: 'center',
          }}
        >
          If you are still seeing this message, please reload the page.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </Stack>
    </Box>
  ) : (
    <>{children}</>
  )
}
