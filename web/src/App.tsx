import { ThemeProvider } from '@mui/material'

import { AuthProvider } from '@redwoodjs/auth'
import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import {
  WorkspaceConsumer,
  WorkspaceProvider,
} from 'src/contexts/active-workspace-context'
import {
  SettingsConsumer,
  SettingsProvider,
} from 'src/contexts/settings-context'
import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'
import './scaffold.css'
import './index.css'
import getTheme from 'src/theme'

import { CustomApolloProvider } from './contexts/custom-apollo-provider'

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AuthProvider type="dbAuth">
        <WorkspaceProvider>
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
        </WorkspaceProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
