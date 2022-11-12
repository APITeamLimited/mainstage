import { getTheme } from '@apiteam/types/src'
import { ThemeProvider } from '@mui/material'

import { AuthProvider } from '@redwoodjs/auth'
import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'

import {
  SettingsConsumer,
  SettingsProvider,
} from 'src/contexts/settings-context'
import Routes from 'src/Routes'

// Some raw css styles are required
import './index.css'
import 'react-reflex/styles.css'
import './simplebar.css'

import { CustomApolloProvider } from './contexts/custom-apollo-provider'

const App = () => (
  // This seems to be causing deetion errors when cross platform
  // <FatalErrorBoundary page={FatalErrorPage}>
  <RedwoodProvider titleTemplate="%PageTitle – %AppTitle">
    <AuthProvider type="dbAuth">
      <SettingsProvider>
        <SettingsConsumer>
          {({ settings }) => (
            <ThemeProvider
              theme={getTheme({
                direction: settings.direction,
                responsiveFontSizes: settings.responsiveFontSizes,
                mode: settings.theme,
              })}
            >
              <CustomApolloProvider>
                <Routes />
              </CustomApolloProvider>
            </ThemeProvider>
          )}
        </SettingsConsumer>
      </SettingsProvider>
    </AuthProvider>
  </RedwoodProvider>
  // </FatalErrorBoundary>
)

export default App
