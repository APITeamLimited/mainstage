import React from 'react'

import InsightsIcon from '@mui/icons-material/Insights'
import LandscapeIcon from '@mui/icons-material/Landscape'
import PublicIcon from '@mui/icons-material/Public'
import { useTheme } from '@mui/material'

import { FeatureOverviewPanel } from 'src/layouts/Landing/components/templates/FeatureOverviewPanel'

const features = [
  {
    title: 'Multi-Region Support',
    description:
      'Each load test is orchestrated globally from multiple servers in the APITeam Cloud, enabling geographic insights into your load test results.',
    icon: PublicIcon,
    image: {
      light: require('public/img/splash/environments-light.png'),
      dark: require('public/img/splash/environments-dark.png'),
    },
  },
  {
    title: 'K6 Compatible',
    description:
      'GlobeTest is bult upon K6, the most popular load testing tool. Import existing tests and run them instantly',
    icon: LandscapeIcon,
    image: {
      light: require('public/img/splash/environments-light.png'),
      dark: require('public/img/splash/environments-dark.png'),
    },
  },
  {
    title: 'Unparalleled Insights',
    description:
      'Easily determine problems with your system at load, get detailed insights, easily export your data to use with your own tools, and more',
    icon: InsightsIcon,
    image: {
      light: require('public/img/splash/environments-light.png'),
      dark: require('public/img/splash/environments-dark.png'),
    },
  },
]

const GlobeTestOverview = (): JSX.Element => {
  const theme = useTheme()

  return (
    <FeatureOverviewPanel
      title={
        <>
          <span
            style={{
              color: theme.palette.primary.main,
            }}
          >
            Load test
          </span>{' '}
          your APIs globally with a single click
        </>
      }
      description="Test your API globally using distributed load testing with
                GlobeTest, our open source load testing tool built on top of K6."
      elements={features}
      alignment="right"
    />
  )
}

export default GlobeTestOverview
