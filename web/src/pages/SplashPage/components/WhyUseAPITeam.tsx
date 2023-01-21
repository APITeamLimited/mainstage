import type { ElementType } from 'react'

import FastForwardIcon from '@mui/icons-material/FastForward'
import InsightsIcon from '@mui/icons-material/Insights'
import PeopleIcon from '@mui/icons-material/People'
import { Typography, useTheme } from '@mui/material'

import { OverviewPanel } from 'src/layouts/Landing/components/templates/OverviewPanel'

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
      'Gain valuable performance insights on your APIs performance at scale with integrated load testing and analytics.',
  },
]

type WhyUseAPITeamProps = {
  locationRef?: React.RefObject<HTMLDivElement>
}

export const WhyUseAPITeam = ({ locationRef }: WhyUseAPITeamProps) => {
  const theme = useTheme()

  return (
    <OverviewPanel
      title={
        <Typography variant="h2" fontWeight="bold" ref={locationRef}>
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
      }
      description="APITeam is an API development platform with integrated load testing.
Design, test and scale your APIs in real-time with your whole team."
      items={overviewMessages}
    />
  )
}
