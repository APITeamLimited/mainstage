import { RESTAuth } from '@apiteam/types/src'

type ClientCredentialsFormProps = {
  auth: RESTAuth & {
    authType: 'oauth-2'
    grantType: 'client-credentials'
  }
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const ClientCredentialsForm = ({
  auth,
  setAuth,
  namespace,
}: ClientCredentialsFormProps) => <></>
