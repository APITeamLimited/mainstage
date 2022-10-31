/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from 'react'

import {
  RunningTestsCountQuery,
  RunningTestsCountQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { GlobeTestIcon } from 'src/components/utils/GlobeTestIcon'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { StatusBarItem } from '../StatusBarItem'

import { RunningTestsDialog } from './RunningTestsDialog'

const RUNNING_TESTS_COUNT_QUERY = gql`
  query RunningTestsCountQuery($teamId: String) {
    runningTestsCount(teamId: $teamId)
  }
`

export const RunningTestsIndicator = () => {
  const workspaceInfo = useWorkspaceInfo()

  const teamId = useMemo(
    () =>
      workspaceInfo?.scope.variant === 'TEAM'
        ? workspaceInfo.scope.variantTargetId
        : null,
    [workspaceInfo]
  )

  const { data } = useQuery<
    RunningTestsCountQuery,
    RunningTestsCountQueryVariables
  >(RUNNING_TESTS_COUNT_QUERY, {
    variables: {
      teamId,
    },
    pollInterval: 1000,
  })

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
