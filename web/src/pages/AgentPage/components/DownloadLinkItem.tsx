import { ElementType, ReactNode } from 'react'

import { Grid, useTheme, Stack, Typography, SvgIcon, Card } from '@mui/material'

type DownloadLinkItemProps = {
  platformName: string
  platformIcon: ElementType
  description: string
  isSmall: boolean
  isFirstChild?: boolean
  inverted?: boolean
  children: ReactNode
}

export const DownloadLinkItem = ({
  platformName,
  platformIcon,
  description,
  isSmall,
  isFirstChild = false,
  inverted,
  children,
}: DownloadLinkItemProps) => {
  const theme = useTheme()

  return (
    <Grid
      item
      xs={12}
      md={4}
      key={platformName}
      style={{
        paddingLeft: isFirstChild || isSmall ? 0 : undefined,
      }}
    >
      <Card
        sx={{
          padding: 2,
          backgroundColor: inverted ? theme.palette.primary.main : undefined,
          height: `calc(100% - ${theme.spacing(4)})`,
        }}
        variant="outlined"
      >
        <Stack
          spacing={2}
          justifyContent="space-between"
          sx={{
            height: '100%',
          }}
        >
          <Stack spacing={2}>
            <Stack spacing={2} direction="row">
              <SvgIcon
                component={platformIcon}
                width={40}
                height={40}
                sx={{
                  color: inverted
                    ? theme.palette.background.paper
                    : theme.palette.primary.main,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: inverted
                    ? theme.palette.background.paper
                    : theme.palette.text.primary,
                }}
              >
                {platformName}
              </Typography>
            </Stack>
            <Typography
              variant="body1"
              style={{
                color: inverted
                  ? theme.palette.background.paper
                  : theme.palette.text.secondary,
              }}
            >
              {description}
            </Typography>
          </Stack>
          {children}
        </Stack>
      </Card>
    </Grid>
  )
}
