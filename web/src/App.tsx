import { ThemeProvider } from '@mui/material'

import { AuthProvider } from '@redwoodjs/auth'
import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'
import theme from 'src/theme'

import './scaffold.css'
import './index.css'
import getTheme from 'src/theme'

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AuthProvider type="dbAuth">
        <ThemeProvider theme={getTheme('light', () => {})}>
          <RedwoodApolloProvider>
            <Routes />
          </RedwoodApolloProvider>
        </ThemeProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
