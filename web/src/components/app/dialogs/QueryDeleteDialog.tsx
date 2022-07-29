import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type QueryDeleteDialogProps = {
  show: boolean
  onClose: () => void
  onDelete: () => void
  title?: string
  description?: string
}

export const QueryDeleteDialog = ({
  show,
  onClose,
  onDelete,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this?',
}: QueryDeleteDialogProps) => (
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
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={() => {
          onClose()
          onDelete()
        }}
        autoFocus
        color="error"
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
)
