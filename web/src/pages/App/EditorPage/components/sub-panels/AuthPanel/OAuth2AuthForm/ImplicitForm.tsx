import { Auth } from '@apiteam/types'

import { FormEnvironmentTextField } from 'src/components/custom-mui'
import { apiTeamOauth2CallbackURL } from 'src/utils/oauth2/backend-callbacks'

import { ClientAuthenticationOption } from './ClientAuthenticationOption'

type ImplicitFormProps = {
  auth: Auth & {
    authType: 'oauth2'
    grantType: 'implicit'
  }
  setAuth: (auth: Auth) => void
  namespace: string
}

export const ImplicitForm = ({
  auth,
  setAuth,
  namespace,
}: ImplicitFormProps) => (
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
      label="Client ID"
      namespace={`${namespace}.clientID`}
      onChange={(value) => setAuth({ ...auth, clientID: value })}
      value={auth.clientID}
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
