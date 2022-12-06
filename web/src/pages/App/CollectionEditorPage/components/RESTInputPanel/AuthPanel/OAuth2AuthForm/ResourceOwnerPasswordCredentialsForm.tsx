import { RESTAuth } from '@apiteam/types/src'

type ResourceOwnerPasswordCredentialsFormProps = {
  auth: RESTAuth & {
    authType: 'oauth-2'
    grantType: 'resource-owner-password-credentials'
  }
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const ResourceOwnerPasswordCredentialsForm = ({
  auth,
  setAuth,
  namespace,
}: ResourceOwnerPasswordCredentialsFormProps) => <></>
