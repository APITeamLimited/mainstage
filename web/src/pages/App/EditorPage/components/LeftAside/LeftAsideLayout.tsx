import { Stack, Typography } from '@mui/material'

type LeftAsideLayoutProps = {
  children?: React.ReactNode
  title: string
  includePB?: boolean
  includePX?: boolean
}

export const LeftAsideLayout = ({
  children,
  title,
  includePB,
  includePX,
}: LeftAsideLayoutProps) => (
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
    </Stack>
    {children}
  </Stack>
)
