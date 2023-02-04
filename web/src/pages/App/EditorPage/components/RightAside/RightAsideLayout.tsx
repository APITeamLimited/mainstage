import CloseIcon from '@mui/icons-material/Close'
import { Stack, Typography, useTheme, IconButton, Tooltip } from '@mui/material'

type RightAsideLayoutProps = {
  children?: React.ReactNode
  title: string
  onCloseAside: () => void
  includePB?: boolean
  includePX?: boolean
}

export const RightAsideLayout = ({
  children,
  title,
  onCloseAside,
  includePB,
  includePX,
}: RightAsideLayoutProps) => {
  const theme = useTheme()

  return (
    <Stack
      spacing={2}
      paddingTop={2}
      paddingBottom={includePB ? 2 : 0}
      paddingX={includePX ? 2 : 0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        height: includePB ? 'calc(100% - 1.5rem)' : 'calc(100% - 0.75rem)',
        maxHeight: includePB ? 'calc(100% - 1.5rem)' : 'calc(100% - 0.75rem)',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          marginX: includePX ? 0 : 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            userSelect: 'none',
          }}
        >
          {title}
        </Typography>
        <Tooltip title="Close">
          <IconButton
            onClick={onCloseAside}
            sx={{
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {children}
    </Stack>
  )
}
