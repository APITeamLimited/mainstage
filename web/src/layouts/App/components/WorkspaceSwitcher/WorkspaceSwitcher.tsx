import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { WorkspaceSwitcherTeamMemberships } from 'types/graphql'

import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import { activeWorkspaceVar, anonymousWorkspace } from 'src/contexts/reactives'

import { WorkspaceSwitcherButton } from './components/WorkspaceSwitcherButton'
import { WorkspaceSwitcherLoading } from './components/WorkspaceSwitcherLoading'

export const MEMBERSHIPS_QUERY = gql`
  query WorkspaceSwitcherTeamMemberships {
    teamMemberships {
      team {
        id
        name
      }
      role
    }
  }
`

export const WorkspaceSwitcher = () => {
  const { currentUser } = useAuth()
  const workspace = useReactiveVar(activeWorkspaceVar)

  // Correct this error if it ever happens
  useEffect(() => {
    if (!currentUser && workspace.__typename !== 'Anonymous') {
      activeWorkspaceVar(anonymousWorkspace)
    }
  }, [currentUser, workspace])

  if (workspace.__typename === 'Anonymous') {
    return <WorkspaceSwitcherButton memberships={[]} />
  }

  return <QueriedWorkspaceSwitcher />
}

const QueriedWorkspaceSwitcher = () => {
  const { loading, error, data } =
    useQuery<WorkspaceSwitcherTeamMemberships>(MEMBERSHIPS_QUERY)
  const [oldQuery, setOldQuery] =
    useState<WorkspaceSwitcherTeamMemberships | null>(null)

  useEffect(() => {
    if (data) {
      setOldQuery(data)
    }
  }, [data])

  if (loading && !oldQuery) {
    return <WorkspaceSwitcherLoading />
  }

  if (loading && oldQuery) {
    return <WorkspaceSwitcherButton memberships={[]} />
  }

  if (data.teamMemberships) {
    return <WorkspaceSwitcherButton memberships={data.teamMemberships} />
  }

  if (error) {
    throw error
  }
}
