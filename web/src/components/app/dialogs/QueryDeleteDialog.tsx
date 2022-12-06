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
  deleteButtonLabel?: string
}

export const QueryDeleteDialog = ({
  show,
  onClose,
  onDelete,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this?',
  deleteButtonLabel = 'Delete',
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
      <Button onClick={onClose} color="secondary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onClose()
          onDelete()
        }}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        color="error"
      >
        {deleteButtonLabel}
      </Button>
    </DialogActions>
  </Dialog>
)
