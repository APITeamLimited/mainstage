import type { MailmanInput, NotifyTrialExpiringData } from '@apiteam/mailman'
import { Membership, Team } from '@prisma/client'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { dispatchEmail } from 'src/lib/mailman'
import { CustomerModel, TeamModel, UserModel } from 'src/models'

import { customerIdentificationSchema } from '..'

export const handleSubscriptionTrialWillEnd = async (event: Stripe.Event) => {
  const subscription = event.data.object as Stripe.Subscription

  // Get customer
  const customer = await CustomerModel.get(subscription.customer as string)

  if (!customer) {
    throw new Error(`Customer not found: ${subscription.customer}`)
  }

  // Get variant and variantTargetId
  const { variant, variantTargetId } = customerIdentificationSchema.parse(
    subscription.metadata
  )

  // Get trial end date
  if (!subscription.trial_end) {
    throw new Error(`Subscription ${subscription.id} does not have a trial end`)
  }

  const toSendUserIds = []
  let adminOwnerMemberships: Membership[] = []
  let team: Team | null = null

  if (variant === 'TEAM') {
    adminOwnerMemberships = await TeamModel.getAdminOwnerMemberships(
      variantTargetId
    )

    team = await TeamModel.get(variantTargetId)

    if (!team) {
      throw new Error(`Team not found: ${variantTargetId}`)
    }

    adminOwnerMemberships.forEach((membership) => {
      toSendUserIds.push(membership.userId)
    })
  } else {
    toSendUserIds.push(variantTargetId)
  }

  const toSendUsers = await UserModel.getMany(toSendUserIds)

  await Promise.all(
    toSendUsers.map(async (user) => {
      if (!user) {
        return Promise.resolve()
      }

      const role = adminOwnerMemberships.find(
        (membership) => membership.userId === user.id
      )?.role

      if (!role || (role !== 'OWNER' && role !== 'ADMIN')) {
        return Promise.resolve()
      }

      const data: MailmanInput<NotifyTrialExpiringData> = {
        template: 'notify-trial-expiring',
        to: user.email,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
        data:
          variant === 'TEAM'
            ? {
                targetName: `${user.firstName} ${user.lastName}`,
                endTimeSeconds: subscription.trial_end as number,
                role: role.toLowerCase() as 'ADMIN' | "OWNER",
                workspaceName: (team as Team).name,
              }
            : {
                targetName: `${user.firstName} ${user.lastName}`,
                endTimeSeconds: subscription.trial_end as number,
                role: 'OWN-ACCOUNT',
                workspaceName: undefined,
              },
      }

      return dispatchEmail(data)
    })
  )
}
