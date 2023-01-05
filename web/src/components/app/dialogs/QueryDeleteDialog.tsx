import { Button, DialogContentText } from '@mui/material'

import { CustomDialog } from 'src/components/custom-mui'

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
  <CustomDialog
    open={show}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    shrinkable
    title={title}
    padBody
    dialogActions={
      <>
        <Button onClick={onClose} variant="contained" color="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onClose()
            onDelete()
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          variant="contained"
          color="error"
        >
          {deleteButtonLabel}
        </Button>
      </>
    }
  >
    <DialogContentText>{description}</DialogContentText>
  </CustomDialog>
)
