import { RESTAuth } from '@apiteam/types/src'

import { FormEnvironmentTextField } from 'src/components/custom-mui'

import { ClientAuthenticationOption } from './ClientAuthenticationOption'

type ResourceOwnerPasswordCredentialsFormProps = {
  auth: RESTAuth & {
    authType: 'oauth2'
    grantType: 'resource-owner-password-credentials'
  }
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const ResourceOwnerPasswordCredentialsForm = ({
  auth,
  setAuth,
  namespace,
}: ResourceOwnerPasswordCredentialsFormProps) => (
  <>
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
      value={auth.scope}
    />
    <ClientAuthenticationOption
      value={auth.clientAuthentication}
      onChange={(value) => setAuth({ ...auth, clientAuthentication: value })}
    />
  </>
)
