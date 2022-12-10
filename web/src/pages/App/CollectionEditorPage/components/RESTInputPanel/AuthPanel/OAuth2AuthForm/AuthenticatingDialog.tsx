import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'

type AuthenticatingDialogProps = {
  open: boolean
  onCancel: () => void
}

export const AuthenticatingDialog = ({
  open,
  onCancel,
}: AuthenticatingDialogProps) => (
  <Dialog open={open} maxWidth="sm" fullWidth>
    <DialogTitle>Authenticating</DialogTitle>
    <Stack
      sx={{
        padding: 4,
      }}
      alignItems="center"
      justifyContent="center"
      spacing={4}
    >
      <Typography
        variant="body1"
        sx={{
          userSelect: 'none',
        }}
      >
        Authenticating in popup window...
      </Typography>
      <CircularProgress
        sx={{
          height: 40,
          width: 40,
        }}
      />
      <Button variant="contained" onClick={onCancel} color="error">
        Cancel
      </Button>
    </Stack>
  </Dialog>
)
