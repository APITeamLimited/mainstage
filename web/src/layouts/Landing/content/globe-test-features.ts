import CompressIcon from '@mui/icons-material/Compress'
import InsightsIcon from '@mui/icons-material/Insights'
import PublicIcon from '@mui/icons-material/Public'

import type { FeatureOverviewElement } from '../components/templates/FeatureOverviewPanel'

export const globeTestFeaturesMinimal: FeatureOverviewElement[] = [
  {
    icon: CompressIcon,
    title: 'Integrated Load Testing',
    description:
      'Run load tests from the same platform you use to build and test your APIs, with no need to switch between tools.',
    image: {
      light: require('public/img/splash/globe-test-graph-light.png'),
      dark: require('public/img/splash/globe-test-graph-dark.png'),
    },
  },
  {
    icon: InsightsIcon,
    title: 'Detailed API Insights',
    description:
      'Easily determine problems with your system at load, plot custom graphs, and compare results across multiple load zones.',
    image: {
      light: require('public/img/splash/globe-test-panel-light.png'),
      dark: require('public/img/splash/globe-test-panel-dark.png'),
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
