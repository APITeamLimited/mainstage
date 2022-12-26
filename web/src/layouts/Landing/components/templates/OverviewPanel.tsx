import { ElementType, ReactNode } from 'react'

import {
  Card,
  Grid,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import {
  mediumPanelSpacing,
  smallPanelSpacing,
} from 'src/layouts/Landing/components/constants'

export type OverviewItem = {
  icon: ElementType
  title: string
  description: string
}

type OverviewPanelProps = {
  title: string | ReactNode
  description: string | ReactNode
  items: OverviewItem[]
}

export const OverviewPanel = ({
  title,
  description,
  items,
}: OverviewPanelProps) => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Stack spacing={mediumPanelSpacing} id="why-use-apiteam">
      <Stack spacing={smallPanelSpacing} alignItems="center">
        {typeof title === 'string' ? (
          <Typography variant="h2" fontWeight="bold">
            {title}
          </Typography>
        ) : (
          title
        )}
        {typeof description === 'string' ? (
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            {description}
          </Typography>
        ) : (
          description
        )}
      </Stack>
      <Grid
        container
        spacing={4}
        sx={{
          width: '100%',
        }}
        alignItems="stretch"
      >
        {items.map((item, i) => (
          <Grid
            item
            xs={12}
            md={4}
            key={i}
            style={{
              paddingLeft: i === 0 || isSmall ? 0 : undefined,
            }}
          >
            <Card
              sx={{
                padding: 2,
                height: `calc(100% - ${theme.spacing(4)})`,
              }}
            >
              <Stack spacing={2}>
                <Stack spacing={2} direction="row">
                  <SvgIcon
                    component={item.icon}
                    width={40}
                    height={40}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {item.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
