import { createContext, useContext } from 'react'

import { ApolloError } from '@apollo/client'
import {
  ListPendingInvitations,
  ListPendingInvitationsVariables,
  ListTeamMembers,
  ListTeamMembersVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

const LIST_PENDING_INVITATIONS = gql`
  query ListPendingInvitations($teamId: String!) {
    invitations(teamId: $teamId) {
      id
      createdAt
      updatedAt
      email
      teamId
      role
    }
  }
`

export const LIST_TEAM_MEMBERS = gql`
  query ListTeamMembers($teamId: String!) {
    memberships(teamId: $teamId) {
      id
      user {
        id
        firstName
        lastName
        email
        profilePicture
      }
      teamId
      role
      createdAt
      updatedAt
    }
  }
`

type MembersInfo = {
  invitationsData: ListPendingInvitations | undefined
  invitationsError: ApolloError | undefined
  refetchInvitations: () => void
  membersData: ListTeamMembers | undefined
  membersError: ApolloError | undefined
  refetchMembers: () => void
}

export const MembersContext = createContext<MembersInfo>({
  invitationsData: undefined,
  invitationsError: undefined,
  refetchInvitations: () => {},
  membersData: undefined,
  membersError: undefined,
  refetchMembers: () => {},
})

export const useMembersInfo = () => useContext(MembersContext)

type MembersInfoProviderProps = {
  children: React.ReactNode
  teamId: string
}

export const MembersInfoProvider = ({
  children,
  teamId,
}: MembersInfoProviderProps) => {
  const workspaceInfo = useWorkspaceInfo()

  const {
    data: invitationsData,
    error: invitationsError,
    refetch: refetchInvitations,
  } = useQuery<ListPendingInvitations, ListPendingInvitationsVariables>(
    LIST_PENDING_INVITATIONS,
    {
      variables: {
        teamId,
      },
      pollInterval: 5000,
    }
  )

  const {
    data: membersData,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery<ListTeamMembers, ListTeamMembersVariables>(LIST_TEAM_MEMBERS, {
    variables: {
      teamId,
    },
    pollInterval: 5000,
    skip: !workspaceInfo.isTeam,
  })

  return (
    <MembersContext.Provider
      value={{
        invitationsData,
        invitationsError,
        refetchInvitations,
        membersData,
        membersError,
        refetchMembers,
      }}
    >
      {children}
    </MembersContext.Provider>
  )
}
