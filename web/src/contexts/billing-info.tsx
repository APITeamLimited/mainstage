import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import {
  PlanInfoQuery,
  PlanInfoQueryVariables,
  TeamCreditsDateQuery,
  TeamCreditsDateQueryVariables,
  UserCreditsDateQuery,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

const PLAN_INFO_QUERY = gql`
  query PlanInfoQuery($teamId: String) {
    currentPlan(teamId: $teamId) {
      id
      createdAt
      updatedAt
      isActive
      name
      verboseName
      description
      maxMembers
      maxConcurrentCloudTests
      maxConcurrentScheduledTests
      maxSimulatedUsers
      maxSimulatedUsers
      monthlyCredits
      loadZones
      maxTestDurationMinutes
      dataRetentionMonths
      maxSimulatedUsers
      priceMonthlyCents
      priceYearlyCents
      freeTrialDays
    }
    credits(teamId: $teamId) {
      freeCredits
      maxFreeCredits
      paidCredits
    }
  }
`

const TEAM_CREDITS_DATE_QUERY = gql`
  query TeamCreditsDateQuery($teamId: String!) {
    team(id: $teamId) {
      freeCreditsAddedAt
    }
  }
`

const USER_CREDITS_DATE_QUERY = gql`
  query UserCreditsDateQuery {
    currentUser {
      freeCreditsAddedAt
    }
  }
`

const PlanInfoContex = createContext<PlanInfoQuery['currentPlan'] | null>(null)
export const usePlanInfo = () => useContext(PlanInfoContex)

type CreditInfo = {
  freeCredits: number
  maxFreeCredits: number
  paidCredits: number
  freeCreditsAddedAt: string
  willUpdateFreeCreditsAt: string
}

const CreditsContex = createContext<CreditInfo | null>(null)
export const useCredits = () => useContext(CreditsContex)

type BillingInfoProviderProps = {
  children: React.ReactNode
}

export const BillingInfoProvider = ({ children }: BillingInfoProviderProps) => {
  const workspaceInfo = useWorkspaceInfo()

  const [willUpdateFreeCreditsAt, setWillUpdateFreeCreditsAt] = useState<
    number | null
  >(0)

  const { data: planInfoData } = useQuery<
    PlanInfoQuery,
    PlanInfoQueryVariables
  >(PLAN_INFO_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    pollInterval: 5000,
  })

  const { data: teamCreditsDate } = useQuery<
    TeamCreditsDateQuery,
    TeamCreditsDateQueryVariables
  >(TEAM_CREDITS_DATE_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    skip:
      !workspaceInfo.isTeam ||
      (willUpdateFreeCreditsAt !== null &&
        new Date().getTime() < willUpdateFreeCreditsAt),

    pollInterval: 5000,
  })

  const { data: userCreditsDate } = useQuery<UserCreditsDateQuery>(
    USER_CREDITS_DATE_QUERY,
    {
      skip:
        workspaceInfo.isTeam ||
        (willUpdateFreeCreditsAt !== null &&
          new Date().getTime() < willUpdateFreeCreditsAt),
      pollInterval: 5000,
    }
  )

  useEffect(() => {
    if (workspaceInfo.isTeam) {
      if (!teamCreditsDate?.team?.freeCreditsAddedAt) {
        return
      }

      setWillUpdateFreeCreditsAt(
        new Date(teamCreditsDate.team.freeCreditsAddedAt).getTime() +
          30 * 24 * 60 * 60 * 1000
      )
      return
    }

    if (!userCreditsDate?.currentUser?.freeCreditsAddedAt) {
      return
    }

    setWillUpdateFreeCreditsAt(
      new Date(userCreditsDate.currentUser.freeCreditsAddedAt).getTime() +
        30 * 24 * 60 * 60 * 1000
    )
    return
  }, [teamCreditsDate, userCreditsDate, workspaceInfo.isTeam])

  const credits = useMemo(() => {
    if (!planInfoData || !willUpdateFreeCreditsAt) {
      return null
    }

    return {
      freeCredits: planInfoData.credits.freeCredits,
      maxFreeCredits: planInfoData.credits.maxFreeCredits,
      paidCredits: planInfoData.credits.paidCredits,
      freeCreditsAddedAt: workspaceInfo.isTeam
        ? (teamCreditsDate?.team?.freeCreditsAddedAt as string)
        : (userCreditsDate?.currentUser?.freeCreditsAddedAt as string),
      willUpdateFreeCreditsAt: new Date(willUpdateFreeCreditsAt).toISOString(),
    }
  }, [
    planInfoData,
    teamCreditsDate,
    userCreditsDate,
    willUpdateFreeCreditsAt,
    workspaceInfo.isTeam,
  ])

  return (
    <PlanInfoContex.Provider
      value={planInfoData ? planInfoData.currentPlan : null}
    >
      <CreditsContex.Provider value={credits}>
        {children}
      </CreditsContex.Provider>
    </PlanInfoContex.Provider>
  )
}
