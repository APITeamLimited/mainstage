import type Stripe from 'stripe'

import { getFreePlanInfo } from 'src/helpers/billing'
import { processFreeCredits } from 'src/jobs/apply-free-credits'
import { CustomerModel, PlanInfoModel, TeamModel, UserModel } from 'src/models'

import { customerIdentificationSchema } from '..'

export const handleSubscriptionUpdated = async (event: Stripe.Event) => {
  const subscription = event.data.object as Stripe.Subscription

  // Get customer
  const customer = await CustomerModel.get(subscription.customer as string)

  if (!customer) {
    throw new Error(`Customer not found: ${subscription.customer}`)
  }

  // Get variant and variantTargetId
  const { variant, variantTargetId } = customerIdentificationSchema.parse(
    customer.metadata
  )

  // Get status
  if (subscription.status === 'past_due') {
    // Update team or user status to pastDue
    await handlePastDue(variant, variantTargetId)
  } else if (
    subscription.status === 'active' ||
    subscription.status === 'trialing'
  ) {
    if (variant === 'TEAM') {
      await handleActivationTeam(variantTargetId)
    } else {
      await handleActivationUser(variantTargetId)
    }
  }
}

const handleActivationTeam = async (teamId: string) => {
  const updatedTeam = await TeamModel.update(teamId, {
    pastDue: false,
  })

  const planInfo = await PlanInfoModel.get(
    updatedTeam.planInfoId ?? (await getFreePlanInfo()).id
  )

  if (!planInfo) {
    throw new Error(`Plan info not found: ${updatedTeam.planInfoId}`)
  }

  if (
    updatedTeam.freeCreditsAddedAt
      ? new Date(updatedTeam.freeCreditsAddedAt).getTime() <
        new Date().getTime() - 30 * 24 * 60 * 60 * 1000
      : true
  ) {
    processFreeCredits({
      team: {
        ...updatedTeam,
        planInfo,
      },
    })
  }
}

const handleActivationUser = async (userId: string) => {
  const updatedUser = await UserModel.update(userId, {
    pastDue: false,
  })

  const planInfo = await PlanInfoModel.get(
    updatedUser.planInfoId ?? (await getFreePlanInfo()).id
  )

  if (!planInfo) {
    throw new Error(`Plan info not found: ${updatedUser.planInfoId}`)
  }

  if (
    updatedUser.freeCreditsAddedAt
      ? new Date(updatedUser.freeCreditsAddedAt).getTime() <
        new Date().getTime() - 30 * 24 * 60 * 60 * 1000
      : true
  ) {
    processFreeCredits({ user: { ...updatedUser, planInfo } })
  }
}

const handlePastDue = async (
  variant: 'TEAM' | 'USER',
  variantTargetId: string
) => {
  // Update team or user status to pastDue
  await (variant === 'TEAM'
    ? TeamModel.update(variantTargetId, { pastDue: true })
    : UserModel.update(variantTargetId, { pastDue: true }))
}
