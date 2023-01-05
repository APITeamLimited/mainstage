import CloudIcon from '@mui/icons-material/Cloud'
import CodeIcon from '@mui/icons-material/Code'
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SnippetFolderIcon from '@mui/icons-material/SnippetFolder'

import { ImporterIcon } from 'src/components/utils/Icons'

import type { FeatureOverviewElement } from '../components/templates/FeatureOverviewPanel'

export const apiClientFeaturesMinimal: FeatureOverviewElement[] = [
  {
    icon: CloudIcon,
    title: 'Fully Featured API Client',
    description:
      'Our real-time, cross-platform web based editor is free to use, with all work automatically being synced to the cloud.',
    image: {
      light: require('public/img/splash/collection-editor-light.png'),
      dark: require('public/img/splash/collection-editor-dark.png'),
    },
  },
  {
    icon: ListAltIcon,
    title: 'Full Environment Support',
    description:
      'Craft requests with fully dynamic variables and environment support. Restrict access to sensitive data with local only environment variables.',
    image: {
      light: require('public/img/splash/environments-light.png'),
      dark: require('public/img/splash/environments-dark.png'),
    },
  },
  {
    icon: CodeIcon,
    title: 'Scripting and testing',
    description:
      'Customise request execution with integrated scripting via GlobeTest. Get and set environment variables from code.',
    image: {
      light: require('public/img/splash/scripting-demo-light.png'),
      dark: require('public/img/splash/scripting-demo-dark.png'),
    },
  },
]

export const extendedApiClientFeatures: FeatureOverviewElement[] = [
  ...apiClientFeaturesMinimal,
  {
    icon: ImporterIcon,
    title: 'Import and Export',
    description:
      'Import and export your collections and environments with ease. Import from Postman, Insomnia, K6 and more.',
    image: {
      light: require('public/img/splash/import-manager-light.png'),
      dark: require('public/img/splash/import-manager-dark.png'),
    },
  },
  {
    icon: IntegrationInstructionsIcon,
    title: 'Automatic Code Generation',
    description:
      "Automatically generate example code based off your APIs and and any dynamic variables you've set.",
    image: {
      light: require('public/img/splash/code-generator-light.png'),
      dark: require('public/img/splash/code-generator-dark.png'),
    },
  },
  {
    icon: SnippetFolderIcon,
    title: 'Project Management',
    description:
      'Isolate your work into projects and collections, separating concerns and keeping your work organised.',
    image: {
      light: require('public/img/splash/projects-demo-light.png'),
      dark: require('public/img/splash/projects-demo-dark.png'),
    },
  },
]
