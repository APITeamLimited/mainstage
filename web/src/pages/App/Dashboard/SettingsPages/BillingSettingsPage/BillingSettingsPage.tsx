import { useMemo } from 'react'

import { Workspace } from '@apiteam/types/src'
import { Stack } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { SideTabManager } from 'src/components/app/dashboard/utils/SideTabManager'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { SETTINGS_TABS } from '..'

import { BillingAddressCard } from './BillingAddressCard'
import { BillingAddressProvider } from './BillingAddressProvider'
import { BillingEmailCard } from './BillingEmailCard'
import { BillingNameCard } from './BillingNameCard'
import { CreditsCard } from './CreditsCard'
import { CurrentPlanCard } from './CurrentPlanCard'
import { PaymentMethodCard } from './PaymentMethodCard'

export const STRIPE_PUBLISHABLE_KEY = process.env[
  'STRIPE_PUBLISHABLE_KEY'
] as string

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('STRIPE_PUBLISHABLE_KEY is not defined')
}

const BillingSettingsPage = () => {
  const workspaceInfo = useWorkspaceInfo()

  const prettyType = useMemo(() => {
    if (!workspaceInfo) return null
    if (workspaceInfo.scope?.variant === 'USER') {
      return 'Personal Account Settings'
    } else {
      return 'Team Settings'
    }
  }, [workspaceInfo])

  const isTeam = useMemo(
    () => (workspaceInfo as Workspace).scope.variant === 'TEAM',
    [workspaceInfo]
  )

  if (!prettyType) return null
  if (!workspaceInfo) return null

  return (
    <BillingAddressProvider>
      <MetaTags title={prettyType} />
      <DashboardPageFrame title={prettyType}>
        <SideTabManager
          basePath={routes.settingsWorkspace()}
          possibleTabs={SETTINGS_TABS}
        >
          <Stack spacing={4}>
            <CurrentPlanCard />
            <CreditsCard />
            <BillingAddressCard />
            <PaymentMethodCard />
            <BillingEmailCard />
            <BillingNameCard />
          </Stack>
        </SideTabManager>
      </DashboardPageFrame>
    </BillingAddressProvider>
  )
}

export default BillingSettingsPage
