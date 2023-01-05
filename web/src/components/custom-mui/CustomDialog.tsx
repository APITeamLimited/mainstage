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
  Tooltip,
} from '@mui/material'

import {
  SimplebarReactModuleProvider,
  useSimplebarReactModule,
} from 'src/contexts/imports'
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
  dialogActions?: ReactNode
  shrinkable?: boolean
  padBody?: boolean
}

export const CustomDialog = (props: CustomDialogProps) => (
  <SimplebarReactModuleProvider>
    <HotkeysModuleProvider>
      <CustomDialogInner {...props} />
    </HotkeysModuleProvider>
  </SimplebarReactModuleProvider>
)

export const customDialogContentHeight = 500

const CustomDialogInner = ({
  open,
  onClose,
  title,
  actionArea,
  children,
  disableScroll,
  fullWidth,
  maxWidth,
  dialogActions,
  shrinkable,
  padBody,
}: CustomDialogProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

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
      sx={{
        overflow: 'hidden',
      }}
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
          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              sx={{
                color: theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider />
      <DialogContent
        sx={{
          height: shrinkable
            ? undefined
            : `${customDialogContentHeight + 24}px`,
          maxWidth: '100%',
          overflow: disableScroll ? 'hidden' : 'auto',
          padding: 0,
        }}
      >
        {disableScroll ? (
          <>
            {padBody ? (
              <Stack spacing={2} p={2}>
                {children}
              </Stack>
            ) : (
              children
            )}
          </>
        ) : (
          <Stack
            sx={{
              height: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
            }}
          >
            <SimpleBar style={{ height: '100%', flex: 1 }}>
              <>
                {padBody ? (
                  <Stack spacing={2} p={2}>
                    {children}
                  </Stack>
                ) : (
                  children
                )}
              </>
            </SimpleBar>
          </Stack>
        )}
      </DialogContent>
      {dialogActions && <Divider />}
      {dialogActions && (
        <Stack
          spacing={2}
          direction="row"
          sx={{
            padding: 2,
          }}
          alignItems="right"
        >
          <div
            style={{
              flex: 1,
            }}
          />
          {dialogActions}
        </Stack>
      )}
    </Dialog>
  )
}
