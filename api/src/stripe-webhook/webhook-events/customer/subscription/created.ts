import { NotifyWelcomeToProData } from '@apiteam/mailman'
import { UserAsPersonal } from '@apiteam/types'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { processFreeCredits } from 'src/jobs/apply-free-credits'
import { dispatchEmail, DispatchEmailInput } from 'src/lib/mailman'
import { CustomerModel, PlanInfoModel, TeamModel, UserModel } from 'src/models'

import { customerIdentificationSchema } from '..'

export const handleSubscriptionCreated = async (event: Stripe.Event) => {
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
    // Need to check succeful invoice payment if active instead of past_due
  }
}

export const handleActivationTeam = async (
  teamId: string,
  subscription: Stripe.Subscription
) => {
  const planInfo = await getPlanInfo(subscription)

  const updatedTeam = await TeamModel.update(teamId, {
    pastDue: false,
    planInfoId: planInfo.id,
  })

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

  const adminOwnerMemberships = await TeamModel.getAdminOwnerMemberships(teamId)

  const adminOwnerUsers = await UserModel.getMany(
    adminOwnerMemberships.map((membership) => membership.userId)
  ).then((users) => users.filter((user): user is UserAsPersonal => !!user))

  await Promise.all(
    adminOwnerUsers.map(async (user) => {
      const role = adminOwnerMemberships.find(
        (membership) => membership.userId === user.id
      )?.role as 'ADMIN' | 'OWNER'

      const input: DispatchEmailInput<NotifyWelcomeToProData> = {
        to: user.email,
        template: 'notify-welcome-to-pro',
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
        data: {
          firstName: user.firstName,
          role,
          workspaceName: updatedTeam.name,
        },
      }

      return await dispatchEmail(input)
    })
  )
}

export const handleActivationUser = async (
  userId: string,
  subscription: Stripe.Subscription
) => {
  const planInfo = await getPlanInfo(subscription)

  const updatedUser = await UserModel.update(userId, {
    pastDue: false,
    planInfoId: planInfo.id,
  })

  if (
    updatedUser.freeCreditsAddedAt
      ? new Date(updatedUser.freeCreditsAddedAt).getTime() <
        new Date().getTime() - 30 * 24 * 60 * 60 * 1000
      : true
  ) {
    processFreeCredits({ user: { ...updatedUser, planInfo } })
  }

  const input: DispatchEmailInput<NotifyWelcomeToProData> = {
    to: updatedUser.email,
    template: 'notify-welcome-to-pro',
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(updatedUser),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
      updatedUser.email
    ),
    data: {
      targetName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      role: 'OWN-ACCOUNT',
      workspaceName: undefined,
    },
  }

  await dispatchEmail(input)
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

const getPlanInfo = async (subscription: Stripe.Subscription) => {
  const allPlanInfos = await PlanInfoModel.getAll()

  if (!subscription.items.data[0].plan.product) {
    throw new Error(`Product not found in subscription: ${subscription.id}`)
  }

  const productId =
    typeof subscription.items.data[0].plan.product === 'string'
      ? subscription.items.data[0].plan.product
      : subscription.items.data[0].plan.product.id

  const planInfo = allPlanInfos.find(
    (planInfo) => planInfo.productId === productId
  )

  if (!planInfo) {
    throw new Error(`Plan info not found: ${productId}`)
  }

  return planInfo
}
