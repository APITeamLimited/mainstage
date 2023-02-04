import { RESTAuth } from '@apiteam/types/src'

import { FormEnvironmentTextField } from 'src/components/custom-mui'
import { apiTeamOauth2CallbackURL } from 'src/utils/oauth2/backend-callbacks'

import { ClientAuthenticationOption } from './ClientAuthenticationOption'

type AuthorizationCodeFormProps = {
  auth: RESTAuth & {
    authType: 'oauth2'
    grantType: 'authorization-code'
  }
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const AuthorizationCodeForm = ({
  auth,
  setAuth,
  namespace,
}: AuthorizationCodeFormProps) => (
  <>
    <FormEnvironmentTextField
      label="Redirect URI"
      namespace={`${namespace}.redirectURI`}
      onChange={() => undefined}
      value={apiTeamOauth2CallbackURL()}
      disabled
      tooltipMessage="This preset value will be used as the redirect URI for the OAuth2 flow"
    />
    <FormEnvironmentTextField
      label="Authorization URL"
      namespace={`${namespace}.authorizationURL`}
      onChange={(value) => setAuth({ ...auth, authorizationURL: value })}
      value={auth.authorizationURL}
    />
    <FormEnvironmentTextField
      label="Access Token URL"
      namespace={`${namespace}.accessTokenURL`}
      onChange={(value) => setAuth({ ...auth, accessTokenURL: value })}
      value={auth.accessTokenURL}
    />
    <FormEnvironmentTextField
      label="Client ID"
      namespace={`${namespace}.clientID`}
      onChange={(value) => setAuth({ ...auth, clientID: value })}
      value={auth.clientID}
    />
    <FormEnvironmentTextField
      label="Client Secret"
      namespace={`${namespace}.clientSecret`}
      onChange={(value) => setAuth({ ...auth, clientSecret: value })}
      value={auth.clientSecret}
    />
    <FormEnvironmentTextField
      label="Scope"
      namespace={`${namespace}.scope`}
      onChange={(value) => setAuth({ ...auth, scope: value })}
      value={auth.scope ?? ''}
    />
    <FormEnvironmentTextField
      label="State"
      namespace={`${namespace}.state`}
      onChange={(value) => setAuth({ ...auth, state: value })}
      value={auth.state}
    />
    <ClientAuthenticationOption
      value={auth.clientAuthentication}
      onChange={(value) => setAuth({ ...auth, clientAuthentication: value })}
    />
  </>
)
