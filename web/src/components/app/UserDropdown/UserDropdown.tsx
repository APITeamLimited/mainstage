import { useEffect, useState } from 'react'

import { useQuery } from '@apollo/client'
import type { UserDropdownCurrentUser } from 'types/graphql'

import { useAuth } from '@redwoodjs/auth'

import { DropdownButton } from './components/DropdownButton'
import { DropdownLoading } from './components/DropdownLoading'

export const CURRENT_USER_QUERY = gql`
  query UserDropdownCurrentUser {
    currentUser {
      id
      firstName
      lastName
      email
      profilePicture
    }
  }
`

export const UserDropdown = () => {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <DropdownButton currentUser={null} />
  }

  return <QueriedUserDropdown />
}

const QueriedUserDropdown = () => {
  const { loading, error, data } =
    useQuery<UserDropdownCurrentUser>(CURRENT_USER_QUERY)

  const [oldQuery, setOldQuery] = useState<UserDropdownCurrentUser | null>(null)

  useEffect(() => {
    if (data) {
      setOldQuery(data)
    }
  }, [data])

  if (loading && !oldQuery) {
    return <DropdownLoading />
  }

  if (loading && oldQuery) {
    return <DropdownButton currentUser={oldQuery.currentUser} />
  }

  if (data.currentUser) {
    return <DropdownButton currentUser={data.currentUser} />
  }

  if (error) {
    throw error
  }
}
