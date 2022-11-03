import { ROUTES } from '@apiteam/types/src'
import CloudIcon from '@mui/icons-material/Cloud'
import CodeIcon from '@mui/icons-material/Code'
import ListAltIcon from '@mui/icons-material/ListAlt'

import { FeatureOverviewPanel } from 'src/layouts/Landing/components/FeatureOverviewPanel'

const editorFeatures = [
  'Unlimited users as standard',
  'Easy importing from Postman, Insomnia, or other API testing tools',
  'Design, debug and test your APIs in real-time',
  'Integrated scripting runtime',
]

const editorFeaturesKeyPoints = [
  {
    icon: CloudIcon,
    title: 'Fully Featured Web-Based Editor',
    description:
      'Our real-time, cross-platform web based editor is free to use for an unlimited number of users, with all work automatically being saved to the cloud.',
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
      'Customise request execution with integrated scripting via GlobeTest. Get and set environment variables from code',
    image: {
      light: require('public/img/splash/scripting-demo-light.png'),
      dark: require('public/img/splash/scripting-demo-dark.png'),
    },
  },
]

const EditorFeatures = (): JSX.Element => {
  return (
    <FeatureOverviewPanel
      title="Real-time collaborative API development platform"
      description="Design, debug and test your APIs in real-time with your whole team
  in our interractive editor."
      elements={editorFeaturesKeyPoints}
      moreInfo={{
        text: 'Learn more about the editor',
        link: ROUTES.aboutCollectionEditor,
      }}
    />
  )
}

export default EditorFeatures
