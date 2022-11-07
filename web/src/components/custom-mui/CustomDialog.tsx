import { ReactNode } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {
  Dialog,
  DialogTitle,
  Stack,
  IconButton,
  Divider,
  useTheme,
  DialogContent,
  DialogProps,
} from '@mui/material'

import {
  HotkeysModuleProvider,
  useHotkeysModule,
} from 'src/contexts/imports/hotkeys-module-provider'

type CustomDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  actionArea?: ReactNode
  children?: ReactNode
  disableScroll?: boolean
  fullWidth?: DialogProps['fullWidth']
  maxWidth?: DialogProps['maxWidth']
}

export const CustomDialog = (props: CustomDialogProps) => (
  <HotkeysModuleProvider>
    <CustomDialogInner {...props} />
  </HotkeysModuleProvider>
)

const CustomDialogInner = ({
  open,
  onClose,
  title,
  actionArea,
  children,
  disableScroll,
  fullWidth,
  maxWidth,
}: CustomDialogProps) => {
  const { useHotkeys } = useHotkeysModule()

  const theme = useTheme()

  useHotkeys(
    'esc',
    () => {
      onClose()
    },
    [onClose]
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          width: '100%',
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            marginRight: 2,
          }}
        >
          {actionArea}
          <IconButton
            onClick={onClose}
            sx={{
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Divider />
      <DialogContent
        sx={{
          height: '500px',
          maxWidth: '100%',
          overflow: disableScroll ? 'hidden' : 'auto',
          padding: disableScroll ? 0 : 2,
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
