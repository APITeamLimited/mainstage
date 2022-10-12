import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type QuerySaveDialogProps = {
  show: boolean
  onClose: () => void
  saveCallback: () => void
  onDelete: () => void
  title?: string
  description?: string
}

export const QuerySaveDialog = ({
  show,
  onClose,
  saveCallback,
  onDelete,
  title = 'Unsaved Changes',
  description = 'Are you sure you want to close without saving? Any unsaved changes will be lost.',
}: QuerySaveDialogProps) => (
  <Dialog
    open={show}
    onClose={onClose}
    aria-labelledby={title}
    aria-describedby={description}
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="secondary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onClose()
          onDelete()
        }}
        color="error"
      >
        Discard Changes
      </Button>
      <Button
        onClick={() => {
          onClose()
          saveCallback()
        }}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        color="primary"
      >
        Save and Close
      </Button>
    </DialogActions>
  </Dialog>
)
