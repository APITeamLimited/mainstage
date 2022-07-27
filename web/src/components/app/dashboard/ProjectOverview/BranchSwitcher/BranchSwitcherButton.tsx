import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Button, Tooltip, useTheme } from '@mui/material'

import { Branch } from 'src/entity-engine/dispatch-handlers/Branches'
import { planInfoVar } from 'src/entity-engine/dispatch-handlers/Workspace'

import { PlanInfo } from '../../../../../../../entity-engine/src/entities'

type BranchSwitcherbuttonProps = {
  activeBranch: Branch
}

export const BranchSwitcherButton = ({
  activeBranch,
}: BranchSwitcherbuttonProps) => {
  const theme = useTheme()
  const planInfo = useReactiveVar(planInfoVar)
  const [branchPlanAccess, setBranchPlanAccess] = useState<BranchPlanAccess>(
    checkIfCanUseBranches(planInfo)
  )

  useEffect(() => {
    setBranchPlanAccess(checkIfCanUseBranches(planInfo))
  }, [planInfo, setBranchPlanAccess])

  return (
    <Tooltip title={branchPlanAccess.denniedReason || 'Switch Branches'}>
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
          disabled={branchPlanAccess.canUseBranches === false}
        >
          {activeBranch.name}
        </Button>
      </span>
    </Tooltip>
  )
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
