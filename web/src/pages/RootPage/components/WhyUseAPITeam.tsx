import type { ElementType } from 'react'

import FastForwardIcon from '@mui/icons-material/FastForward'
import InsightsIcon from '@mui/icons-material/Insights'
import PeopleIcon from '@mui/icons-material/People'
import {
  Card,
  Grid,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

type OverviewItem = {
  icon: ElementType
  title: string
  description: string
}

const overviewMessages: OverviewItem[] = [
  {
    icon: FastForwardIcon,
    title: 'Get started in minutes',
    description:
      'Import existing collections and API resources from Postman, Insomnia, and K6 and get started instantly.',
  },
  {
    icon: PeopleIcon,
    title: 'Develop Collaboratively',
    description:
      'Collaborate in real time with unlimited users on the same team. Develop and share collections, API resources, and load tests with your team, all in one place.',
  },
  {
    icon: InsightsIcon,
    title: 'Scale Confidently',
    description:
      'Gain valuable performance insights on your APIs performance at scale with integrated load testing, analytics, and monitoring.',
  },
]

export const WhyUseAPITeam = () => {
  const theme = useTheme()

  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Stack spacing={4}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h2" sx={{ fontWeight: 600 }}>
          Why use{' '}
          <span
            style={{
              color: theme.palette.primary.main,
            }}
          >
            APITeam
          </span>
          ?
        </Typography>
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
          APITeam is an API development platform with integrated load testing.
          Design, test and scale your APIs in real-time with your whole team.
        </Typography>
      </Stack>
      <Grid
        container
        spacing={isSmall ? 0 : 4}
        sx={{
          width: '100%',
          height: 'min-content',
        }}
      >
        {overviewMessages.map((item, i) => (
          <Grid
            item
            xs={12}
            md={4}
            key={i}
            style={{
              paddingLeft: i === 0 || isSmall ? 0 : undefined,
            }}
            sx={{
              paddingBottom: isSmall ? 4 : undefined,
            }}
          >
            <Card
              sx={{
                padding: 2,
                // Make sure all cards are the same height
                height: '80%',
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
