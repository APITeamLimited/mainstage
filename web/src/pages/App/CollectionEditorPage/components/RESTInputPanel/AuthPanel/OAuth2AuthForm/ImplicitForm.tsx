import { RESTAuth } from '@apiteam/types/src'

type ImplicitFormProps = {
  auth: RESTAuth & {
    authType: 'oauth-2'
    grantType: 'implicit'
  }
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const ImplicitForm = ({
  auth,
  setAuth,
  namespace,
}: ImplicitFormProps) => <></>
