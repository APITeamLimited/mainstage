import { RESTAuth } from '@apiteam/types/src'

import {
  CustomFormRadioGroup,
  FormEnvironmentTextField,
} from 'src/components/custom-mui'
import { apiTeamOauth2CallbackURL } from 'src/utils/oauth2/backend-callbacks'

import { ClientAuthenticationOption } from './ClientAuthenticationOption'

type AuthorizationCodeWithPkceFormProps = {
  auth: RESTAuth & {
    authType: 'oauth2'
    grantType: 'authorization-code-with-pkce'
  }
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const AuthorizationCodeWithPkceForm = ({
  auth,
  setAuth,
  namespace,
}: AuthorizationCodeWithPkceFormProps) => (
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
    <CustomFormRadioGroup
      label="Code Challenge Method"
      name="codeChallengeMethod"
      onChange={(event) =>
        setAuth({
          ...auth,
          codeChallengeMethod: event.target.value as 'S256' | 'plain',
        })
      }
      value={auth.codeChallengeMethod}
      options={[
        { label: 'SHA-256', value: 'S256' },
        { label: 'Plain', value: 'plain' },
      ]}
    />
    <FormEnvironmentTextField
      label="Code Verifier"
      namespace={`${namespace}.codeVerifier`}
      onChange={(value) => setAuth({ ...auth, codeVerifier: value })}
      value={auth.codeVerifier}
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
