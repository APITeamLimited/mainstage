import {
  Grid,
  Stack,
  useTheme,
  Divider,
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { RESTAuth } from 'src/contexts/reactives'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import InputIcon from '@mui/icons-material/Input'
import { BasicAuthForm } from './BasicAuthForm'
import { BearerAuthForm } from './BearerAuthForm'
import { OAuth2AuthForm } from './OAuth2AuthForm'
import { APIKeyAuthForm } from './APIKeyAuthForm'

const authMethodLabels = [
  {
    authType: 'inherit',
    label: 'Inherit',
  },
  {
    authType: 'none',
    label: 'None',
  },
  {
    authType: 'basic',
    label: 'Basic',
  },
  {
    authType: 'bearer',
    label: 'Bearer',
  },
  {
    authType: 'oauth-2',
    label: 'OAuth 2',
  },
  {
    authType: 'api-key',
    label: 'API Key',
  },
]

type AuthorisationPanelProps = {
  auth: RESTAuth
  setAuth: (auth: RESTAuth) => void
}

export const AuthorisationPanel = ({
  auth,
  setAuth,
}: AuthorisationPanelProps) => {
  const theme = useTheme()

  const handleChangeAuthType = (newAuthType: string) => {
    if (newAuthType === 'inherit') {
      setAuth({
        authType: 'inherit',
        authActive: true,
      })
    } else if (newAuthType === 'none') {
      setAuth({
        authType: 'none',
        authActive: true,
      })
    } else if (newAuthType === 'basic') {
      setAuth({
        authType: 'basic',
        authActive: true,
        username: '',
        password: '',
      })
    } else if (newAuthType === 'bearer') {
      setAuth({
        authType: 'bearer',
        authActive: true,
        token: '',
      })
    } else if (newAuthType === 'oauth-2') {
      setAuth({
        authType: 'oauth-2',
        authActive: true,
        token: '',
        oidcDiscoveryURL: '',
        authURL: '',
        accessTokenURL: '',
        clientID: '',
        scope: '',
      })
    } else if (newAuthType === 'api-key') {
      setAuth({
        authType: 'api-key',
        authActive: true,
        key: '',
        value: '',
        addTo: '',
      })
    } else {
      throw `handleChangeAuthType unsupported authType: ${newAuthType}`
    }
  }

  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
        margin: 0,
      }}
    >
      <Grid container spacing={2} margin={0}>
        {authMethodLabels.map((authMethod, index) => (
          <Chip
            color="primary"
            key={index}
            label={
              <Typography
                sx={{
                  color:
                    auth.authType === authMethod.authType
                      ? 'inherit'
                      : 'text.secondary',
                }}
              >
                {authMethod.label}
              </Typography>
            }
            variant={
              auth.authType === authMethod.authType ? 'filled' : 'outlined'
            }
            onClick={() => handleChangeAuthType(authMethod.authType)}
            size="small"
            sx={{
              marginRight: 1,
              marginBottom: 1,
              borderWidth:
                auth.authType === authMethod.authType ? undefined : 0,
            }}
          />
        ))}
      </Grid>
      {auth.authType === 'inherit' && (
        <Stack
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <InputIcon
            sx={{
              marginBottom: 2,
              width: 80,
              height: 80,
              color: theme.palette.action.disabled,
            }}
          />
          <Typography variant="h6">Inherit</Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            Auth type is inherited from parent folder or collection
          </Typography>
        </Stack>
      )}
      {auth.authType === 'none' && (
        <Stack
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <LockOpenIcon
            sx={{
              marginBottom: 2,
              width: 80,
              height: 80,
              color: theme.palette.action.disabled,
            }}
          />
          <Typography variant="h6">None</Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            No authentication will be used
          </Typography>
        </Stack>
      )}
      {auth.authType === 'basic' && (
        <Stack
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <BasicAuthForm auth={auth} setAuth={setAuth} />
        </Stack>
      )}
      {auth.authType === 'bearer' && (
        <Stack
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <BearerAuthForm auth={auth} setAuth={setAuth} />
        </Stack>
      )}
      {auth.authType === 'oauth-2' && (
        <Stack
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <OAuth2AuthForm auth={auth} setAuth={setAuth} />
          </Stack>)}
      {auth.authType === 'api-key' && (
        <Stack

          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <APIKeyAuthForm auth={auth} setAuth={setAuth} />
          </Stack>)}
    </Stack>
  )
}
