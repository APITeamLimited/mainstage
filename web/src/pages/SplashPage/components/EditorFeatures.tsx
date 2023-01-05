import { ROUTES } from '@apiteam/types/src'
import { useTheme } from '@mui/material'

import { FeatureOverviewPanel } from 'src/layouts/Landing/components/templates/FeatureOverviewPanel'
import { apiClientFeaturesMinimal } from 'src/layouts/Landing/content/api-client-features'

const EditorFeatures = () => {
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
            Real-time
          </span>{' '}
          collaborative API Client
        </>
      }
      description="Design, debug and test your APIs in real-time with your whole team
  within our interactive editor. Easily import your existing API designs from Postman,
  Insomnia, or other API testing tools. Create custom scripts and to automate your
  workflows, and run them within our integrated scripting runtime."
      elements={apiClientFeaturesMinimal}
      moreInfo={{
        text: 'Learn more about the editor',
        link: ROUTES.apiClient,
      }}
    />
  )
}

export default EditorFeatures
