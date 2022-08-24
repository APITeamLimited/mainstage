import { IsAdminQuery } from 'types/graphql'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'
import { useQuery } from '@redwoodjs/web'

const IS_ADMIN_QUERY = gql`
  query IsAdminQuery {
    currentUser {
      isAdmin
    }
  }
`

type GuardProps = {
  children?: React.ReactNode
}

export const AdminGuard = ({ children }: GuardProps) => {
  const { isAuthenticated } = useAuth()

  const { data } = useQuery<IsAdminQuery>(IS_ADMIN_QUERY, {
    skip: !isAuthenticated,
  })

  if (data?.currentUser.isAdmin === false) {
    navigate(routes.splash())
  }

  return data?.currentUser.isAdmin ? <>{children}</> : <></>
}
