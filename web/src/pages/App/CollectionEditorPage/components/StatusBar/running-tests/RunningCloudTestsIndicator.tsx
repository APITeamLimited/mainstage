/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react'

import { makeVar, useReactiveVar } from '@apollo/client'
import { Skeleton } from '@mui/material'
import {
  RunningCloudTestsCountQuery,
  RunningCloudTestsCountQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { GlobeTestIcon } from 'src/components/utils/Icons'
import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { StatusBarItem } from '../StatusBarItem'

import { RunningCloudTestsDialog } from './RunningCloudTestsDialog'

const RUNNING_CLOUD_TESTS_COUNT_QUERY = gql`
  query RunningCloudTestsCountQuery($teamId: String) {
    runningTestsCount(teamId: $teamId)
  }
`

export const refetchRunningCountVar = makeVar(0)

export const RunningCloudTestsIndicator = () => {
  const workspaceInfo = useWorkspaceInfo()
  const planInfo = usePlanInfo()

  const teamId = useMemo(
    () =>
      workspaceInfo?.scope.variant === 'TEAM'
        ? workspaceInfo.scope.variantTargetId
        : null,
    [workspaceInfo]
  )

  const { data, refetch } = useQuery<
    RunningCloudTestsCountQuery,
    RunningCloudTestsCountQueryVariables
  >(RUNNING_CLOUD_TESTS_COUNT_QUERY, {
    variables: {
      teamId,
    },
    pollInterval: 10000,
  })

  const refetchRunningCount = useReactiveVar(refetchRunningCountVar)

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchRunningCount])

  const [dialogOpen, setDialogOpen] = useState(false)

  if (!data || !planInfo) {
    return <Skeleton variant="rectangular" width={175.47} height={22} />
  }

  return (
    <>
      <StatusBarItem
        icon={GlobeTestIcon}
        tooltip="Cloud tests"
        text={`${data.runningTestsCount}/${planInfo.maxConcurrentCloudTests} Running Cloud Tests`}
        onClick={() => setDialogOpen(true)}
      />
      <RunningCloudTestsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
