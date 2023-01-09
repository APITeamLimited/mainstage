import { ReactNode, ElementType } from 'react'

import { Stack, Typography, Card, SvgIcon, useTheme, Box } from '@mui/material'

export type CardElementFrameProps = {
  title: string
  children: ReactNode
  icon?: ElementType
}

export const CardElementFrame = ({
  title,
  children,
  icon,
}: CardElementFrameProps) => {
  const theme = useTheme()

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Typography variant="h6">{title}</Typography>

      <Card variant="outlined" sx={{ p: 1 }}>
        {icon ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <SvgIcon
              component={icon}
              sx={{
                margin: 0,
                padding: 0,
                width: 20,
                height: 20,
                color: theme.palette.grey[500],
              }}
            />
            <Box sx={{ flexGrow: 1 }}>{children}</Box>
          </Stack>
        ) : (
          children
        )}
      </Card>
    </Stack>
  )
}
