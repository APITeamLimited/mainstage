import { RESTAuth, RESTAuthBearer, RESTAuthOAuth2 } from 'src/contexts/reactives'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Stack, TextField, Typography, useTheme } from '@mui/material'



type OAuth2AuthFormProps = {
  auth: RESTAuthOAuth2 & { authActive: boolean }
  setAuth: (auth: RESTAuth) => void
}

export const OAuth2AuthForm = ({ auth, setAuth }: OAuth2AuthFormProps) => {
  const theme = useTheme()
  const formik = useFormik({
    initialValues: {
      token: auth.token,
      oidcDiscoveryURL: auth.oidcDiscoveryURL,
      authURL: auth.authURL,
      accessTokenURL: auth.accessTokenURL,
      clientID: auth.clientID,
      scope: auth.scope,
    },
    validationSchema: Yup.object({
      token: Yup.string().required('Bearer token is required'),
      oidcDiscoveryURL: Yup.string().required('OIDC discovery URL is required'),
      authURL: Yup.string().required('Auth URL is required'),
      accessTokenURL: Yup.string().required('Access token URL is required'),
      clientID: Yup.string().required('Client ID is required'),
      scope: Yup.string().required('Scope is required'),
    }),
    onSubmit: (values) => {
      setAuth({
        authType: 'oauth-2',
        authActive: true,
        token: values.token,
        oidcDiscoveryURL: values.oidcDiscoveryURL,
        authURL: values.authURL,
        accessTokenURL: values.accessTokenURL,
        clientID: values.clientID,
        scope: values.scope,
      })
    },
  })

  return (
    <form noValidate onSubmit={formik.handleSubmit} style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      Todo - OAuth2AuthForm
    </form>
  )
}
