/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react'

import { makeVar, useReactiveVar } from '@apollo/client'
import {
  RunningTestsCountQuery,
  RunningTestsCountQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { GlobeTestIcon } from 'src/components/utils/Icons'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { StatusBarItem } from '../StatusBarItem'

import { RunningTestsDialog } from './RunningTestsDialog'

const RUNNING_TESTS_COUNT_QUERY = gql`
  query RunningTestsCountQuery($teamId: String) {
    runningTestsCount(teamId: $teamId)
  }
`

export const refetchRunningCountVar = makeVar(0)

export const RunningTestsIndicator = () => {
  const workspaceInfo = useWorkspaceInfo()

  const teamId = useMemo(
    () =>
      workspaceInfo?.scope.variant === 'TEAM'
        ? workspaceInfo.scope.variantTargetId
        : null,
    [workspaceInfo]
  )

  const { data, refetch } = useQuery<
    RunningTestsCountQuery,
    RunningTestsCountQueryVariables
  >(RUNNING_TESTS_COUNT_QUERY, {
    variables: {
      teamId,
    },
    pollInterval: 2000,
  })

  const refetchRunningCount = useReactiveVar(refetchRunningCountVar)

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchRunningCount])

  const [dialogOpen, setDialogOpen] = useState(false)

  if (!data) return <></>

  return (
    <>
      <StatusBarItem
        icon={GlobeTestIcon}
        tooltip="Running tests"
        text={`${data.runningTestsCount}/5 running tests`}
        onClick={() => setDialogOpen(true)}
      />
      <RunningTestsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
