import { getTheme } from '@apiteam/types'
import { ThemeProvider } from '@mui/material'

import { AuthProvider } from '@redwoodjs/auth'
import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'

import {
  SettingsConsumer,
  SettingsProvider,
} from 'src/contexts/settings-context'
import { FatalErrorPage } from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

// Some raw css styles are required
import './index.css'
import 'react-reflex/styles.css'
import './simplebar.css'

import { CustomApolloProvider } from './contexts/custom-apollo-provider'

const App = () => (
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
          <FatalErrorBoundary page={FatalErrorPage}>
            <RedwoodProvider titleTemplate="%PageTitle">
              <AuthProvider type="dbAuth">
                <CustomApolloProvider>
                  <Routes />
                </CustomApolloProvider>
              </AuthProvider>
            </RedwoodProvider>
          </FatalErrorBoundary>
        </ThemeProvider>
      )}
    </SettingsConsumer>
  </SettingsProvider>
)

export default App
