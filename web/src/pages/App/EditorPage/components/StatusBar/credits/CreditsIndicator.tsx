/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react'

import { Skeleton } from '@mui/material'

import { CreditsIcon } from 'src/components/utils/Icons'
import { useCredits } from 'src/contexts/billing-info'
import { displayCorrectCredits } from 'src/utils/display-correct-credits'

import { StatusBarItem } from '../StatusBarItem'

const numberFormatter = new Intl.NumberFormat('en-US')

export const CreditsIndicator = () => {
  const credits = useCredits()

  const totalCredits = useMemo(
    () =>
      numberFormatter.format(
        displayCorrectCredits(
          credits ? credits.freeCredits + credits.paidCredits : 0
        )
      ),
    [credits]
  )

  if (!credits) {
    return <Skeleton variant="rectangular" width={175.47} height={22} />
  }

  return (
    <>
      <StatusBarItem
        icon={CreditsIcon}
        tooltip={`You have ${totalCredits} total credits`}
        text={`${totalCredits} Credits`}
      />
    </>
  )
}
