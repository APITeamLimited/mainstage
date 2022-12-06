import { RESTAuth } from '@apiteam/types/src'

type AuthorizationCodeFormProps = {
  auth: RESTAuth & {
    authType: 'oauth-2'
    grantType: 'authorization-code'
  }
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const AuthorizationCodeForm = ({
  auth,
  setAuth,
  namespace,
}: AuthorizationCodeFormProps) => <></>
