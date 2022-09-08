import { useApolloClient } from '@apollo/client'

import { useAuth } from '@redwoodjs/auth'

type AcceptInvitaitonProps = {
  token: string
}

const ACCEPT_INVIATION = gql`
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token)
  }
`

export const AcceptInvitation = ({ token }: AcceptInvitaitonProps) => {
  const [acceptInvitation, { data, loading, error }] = useApolloClient()
  const { isAuthenticated } = useAuth()
}
