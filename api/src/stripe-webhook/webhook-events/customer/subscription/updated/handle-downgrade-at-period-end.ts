import { NotifyDowngradeAtPeriodEndData } from '@apiteam/mailman'
import { UserAsPersonal } from '@apiteam/types'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { dispatchEmail, DispatchEmailInput } from 'src/lib/mailman'
import { CustomerModel, PlanInfoModel, TeamModel, UserModel } from 'src/models'

import { customerIdentificationSchema } from '../..'

export const handleNotifyDowngradeAtPeriodEnd = async (
  subscription: Stripe.Subscription
): Promise<void> => {
  if (!subscription.customer) {
    throw new Error('Subscription has no customer')
  }

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const customer = await CustomerModel.get(customerId)

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`)
  }

  const { variant, variantTargetId } = customerIdentificationSchema.parse(
    customer.metadata
  )

  if (variant === 'TEAM') {
    await handleNotifyDowngradeAtPeriodEndTeam(variantTargetId, subscription)
  }

  if (variant === 'USER') {
    await handleNotifyDowngradeAtPeriodEndUser(variantTargetId, subscription)
  }
}

const handleNotifyDowngradeAtPeriodEndTeam = async (
  teamId: string,
  subscription: Stripe.Subscription
): Promise<void> => {
  const team = await TeamModel.get(teamId).then((team) => {
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`)
    }

    return team
  })

  const adminOwnerMemberships = await TeamModel.getAdminOwnerMemberships(
    team.id
  )
  const adminOwnerUsers = await UserModel.getMany(
    adminOwnerMemberships.map((membership) => membership.id)
  ).then((users) => users.filter((user): user is UserAsPersonal => !!user))

  if (!team.planInfoId) {
    throw new Error(`Team has no planInfoId: ${team.id}`)
  }

  const verbosePlanName = await PlanInfoModel.get(team.planInfoId).then(
    (planInfo) => {
      if (!planInfo) {
        throw new Error(`PlanInfo not found: ${team.planInfoId}`)
      }

      return planInfo.verboseName
    }
  )

  await Promise.all(
    adminOwnerUsers.map(async (user) => {
      const role = adminOwnerMemberships.find(
        (membership) => membership.id === user.id
      )?.role as 'ADMIN' | 'OWNER'

      if (!role) {
        throw new Error(`Membership not found: ${user.id}`)
      }

      const data: DispatchEmailInput<NotifyDowngradeAtPeriodEndData> = {
        template: 'notify-downgrade-at-period-end',
        to: user.email,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
        data: {
          targetName: `${user.firstName} ${user.lastName}`,
          role,
          endDateSeconds: subscription.current_period_end,
          verbosePlanName,
          workspaceName: team.name,
        },
      }

      return dispatchEmail(data)
    })
  )
}

const handleNotifyDowngradeAtPeriodEndUser = async (
  userId: string,
  subscription: Stripe.Subscription
): Promise<void> => {
  const user = await UserModel.get(userId).then((user) => {
    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    return user
  })

  if (!user.planInfoId) {
    throw new Error(`User has no planInfoId: ${user.id}`)
  }

  const verbosePlanName = await PlanInfoModel.get(user.planInfoId).then(
    (planInfo) => {
      if (!planInfo) {
        throw new Error(`PlanInfo not found: ${user.planInfoId}`)
      }

      return planInfo.verboseName
    }
  )

  const data: DispatchEmailInput<NotifyDowngradeAtPeriodEndData> = {
    template: 'notify-downgrade-at-period-end',
    to: user.email,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
    data: {
      targetName: `${user.firstName} ${user.lastName}`,
      endDateSeconds: subscription.current_period_end,
      verbosePlanName,
      role: 'OWN-ACCOUNT',
      workspaceName: undefined,
    },
  }

  await dispatchEmail(data)
}
