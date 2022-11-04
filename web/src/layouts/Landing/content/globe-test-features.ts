import AppsIcon from '@mui/icons-material/Apps'
import CompressIcon from '@mui/icons-material/Compress'
import InsightsIcon from '@mui/icons-material/Insights'

import type { FeatureOverviewElement } from '../components/templates/FeatureOverviewPanel'

export const globeTestFeaturesMinimal: FeatureOverviewElement[] = [
  /*

  TODO: Re-enable when geographic insights is created

  {
    icon: PublicIcon,
    title: 'Multi-Region Support',
    description:
      'Each load test is orchestrated globally from multiple servers in the APITeam Cloud, enabling geographic insights into your load test results.',
    image: {
      light: require('public/img/splash/environments-light.png'),
      dark: require('public/img/splash/environments-dark.png'),
    },
  },*/
  {
    icon: CompressIcon,
    title: 'Integrated Load Testing',
    description:
      'Run load tests from the same platform you use to build and test your APIs, with no need to switch between tools.',
    image: {
      light: require('public/img/splash/globe-test-panel-light.png'),
      dark: require('public/img/splash/globe-test-panel-dark.png'),
    },
  },
  {
    icon: InsightsIcon,
    title: 'Detailed API Insights',
    description:
      'Easily determine problems with your system at load, plot custom graphs, and compare results across multiple load tests.',
    image: {
      light: require('public/img/splash/globe-test-graph-light.png'),
      dark: require('public/img/splash/globe-test-graph-dark.png'),
    },
  },
  {
    icon: AppsIcon,
    title: 'Built-In Tests',
    description:
      'Get started with minimal configuration by running one of our many built-in tests that simulate a variety of real-world scenarios, or create your own.',
    image: {
      light: require('public/img/splash/built-in-script-light.png'),
      dark: require('public/img/splash/built-in-script-dark.png'),
    },
  },
]

export const extendedGlobeTestFeatures: FeatureOverviewElement[] = [
  ...globeTestFeaturesMinimal,
]
