import { IsAdminQuery } from 'types/graphql'

import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import NotFoundCover from 'src/components/NotFoundCover'

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
    return <NotFoundCover />
  }

  return data?.currentUser.isAdmin ? <>{children}</> : <></>
}
