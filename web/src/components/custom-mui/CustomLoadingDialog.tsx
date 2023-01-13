import { Button, Skeleton } from '@mui/material'

import { CustomDialog } from './CustomDialog'

type CustomLoadingDialogProps = {
  open: boolean
  onClose: () => void
  title: string
}

export const CustomLoadingDialog = ({
  open,
  onClose,
  title,
}: CustomLoadingDialogProps) => {
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="md"
      fullWidth
      padBody
      shrinkable
      scrollHeight={600}
      dialogActions={
        <Button variant="outlined" onClick={onClose} color="error">
          Cancel
        </Button>
      }
    >
      <Skeleton variant="rectangular" height="100%" />
    </CustomDialog>
  )
}
