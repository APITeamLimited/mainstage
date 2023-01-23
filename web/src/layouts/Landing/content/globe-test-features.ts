import InsightsIcon from '@mui/icons-material/Insights'
import LaptopIcon from '@mui/icons-material/Laptop'
import PublicIcon from '@mui/icons-material/Public'

import type { FeatureOverviewElement } from '../components/templates/FeatureOverviewPanel'

export const globeTestFeaturesMinimal: FeatureOverviewElement[] = [
  {
    icon: InsightsIcon,
    title: 'Integrated Load Testing',
    description:
      'Easily determine problems with your system at load, plot custom graphs, and compare results across multiple load zones.',
    image: {
      light: require('public/img/splash/globe-test-panel-light.png'),
      dark: require('public/img/splash/globe-test-panel-dark.png'),
    },
  },
  {
    icon: LaptopIcon,
    title: 'Run on Localhost',
    description:
      "Run load tests on localhost or private networks and get real-time insights into your system's performance that your team can access from anywhere.",
    image: {
      light: require('public/img/splash/globe-test-localhost-light.png'),
      dark: require('public/img/splash/globe-test-localhost-dark.png'),
    },
  },
  {
    icon: PublicIcon,
    title: 'Globally Distributed Load Testing',
    description:
      'Load tests can be run from 19 simultaneous locations around the world, including the US, Europe, and Asia, enabling geographic insights into your load test results.',
    image: {
      light: require('public/img/splash/geographic-insights-light.png'),
      dark: require('public/img/splash/geographic-insights-dark.png'),
    },
  },
]

export const extendedGlobeTestFeatures: FeatureOverviewElement[] = [
  ...globeTestFeaturesMinimal,
]
