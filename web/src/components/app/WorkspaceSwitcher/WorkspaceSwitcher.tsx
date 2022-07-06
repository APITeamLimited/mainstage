import { useEffect, useState } from 'react'

import { WorkspaceSwitcherTeamMemberships } from 'types/graphql'

import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import { anonymousWorkspace } from 'src/contexts/active-workspace-context'
import { useActiveWorkspace } from 'src/hooks/use-active-workspace'

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
  const { workspace, setWorkspace } = useActiveWorkspace()

  // Correct this error if it ever happens
  useEffect(() => {
    if (!currentUser && workspace.__typename !== 'Anonymous') {
      setWorkspace(anonymousWorkspace)
    }
  }, [currentUser, setWorkspace, workspace])

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
