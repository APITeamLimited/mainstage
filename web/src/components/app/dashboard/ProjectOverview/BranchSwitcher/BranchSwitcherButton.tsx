import { useEffect, useState } from 'react'

import { Branch } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Button, Skeleton, Tooltip } from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { activeWorkspaceIdVar, workspacesVar } from 'src/contexts/reactives'

type BranchSwitcherbuttonProps = {
  activeBranch: Branch
}

export const BranchSwitcherButton = ({
  activeBranch,
}: BranchSwitcherbuttonProps) => {
  const activeWorkspaceId = useReactiveVar(activeWorkspaceIdVar)
  const workspaces = useReactiveVar(workspacesVar)
  //const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)

  //const [branchPlanAccess, setBranchPlanAccess] = useState<BranchPlanAccess>(
  //  checkIfCanUseBranches(planInfo)
  //)

  //useEffect(() => {
  //  const activeWorkspace = workspaces.find(
  //    (workspace) => workspace.id === activeWorkspaceId
  //  )
  //  if (activeWorkspace) {
  //    setPlanInfo(activeWorkspace.planInfo)
  //  }
  //}, [activeWorkspaceId, workspaces])

  //useEffect(() => {
  //  setBranchPlanAccess(checkIfCanUseBranches(planInfo))
  //}, [planInfo, setBranchPlanAccess])

  //if (!planInfo)
  //  return <Skeleton variant="rectangular" width={82.5} height={22.75} />

  // TODO: Add button back when branches are ready
  return <></>

  /*return (
    //<Tooltip title={branchPlanAccess.denniedReason || 'Switch Branches'}>
    <Tooltip title="Branches coming soon">
      <span>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          startIcon={
            <AltRouteIcon
              sx={{
                transform: 'rotate(90deg)',
              }}
            />
          }
          endIcon={<ArrowDropDownIcon />}
          sx={{
            marginTop: 1,
          }}
          disabled
          //disabled={branchPlanAccess.canUseBranches === false}
        >
          {activeBranch.name}
        </Button>
      </span>
    </Tooltip>
  )*/
}

type BranchPlanAccess = {
  canUseBranches: boolean
  denniedReason: string | null
}

const checkIfCanUseBranches = (planInfo: PlanInfo | null) => {
  if (!planInfo) {
    return {
      canUseBranches: false,
      denniedReason: 'No plan info',
    }
  } else if (planInfo.type === 'LOCAL' || planInfo.type === 'FREE') {
    return {
      canUseBranches: false,
      denniedReason: 'Sign up to the Pro plan to use branches',
    }
  } else if (planInfo.type === 'PRO' || planInfo.type === 'ENTERPRISE') {
    return {
      canUseBranches: true,
      denniedReason: null,
    }
  }
  throw 'Unknown plan type'
}
