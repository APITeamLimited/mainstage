import { NotifyDowngradeFreeTierData } from '@apiteam/mailman'
import { UserAsPersonal } from '@apiteam/types'
import type Stripe from 'stripe'

import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers'
import { getFreePlanInfo } from 'src/helpers/billing'
import { dispatchEmail, DispatchEmailInput } from 'src/lib/mailman'
import { CustomerModel, TeamModel, UserModel } from 'src/models'

import { customerIdentificationSchema } from '..'

export const handleSubscriptionDeleted = async (event: Stripe.Event) => {
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

  variant === 'TEAM'
    ? handleDeactivationTeam(variantTargetId)
    : handleDeactivationUser(variantTargetId)
}

const handleDeactivationTeam = async (teamId: string) => {
  const freePlanInfo = await getFreePlanInfo()

  const updatedTeam = await TeamModel.update(teamId, {
    planInfoId: freePlanInfo.id,
    pastDue: false,
  })

  const adminOwnerMemberships = await TeamModel.getAdminOwnerMemberships(teamId)

  const adminOwnerUsers = await UserModel.getMany(
    adminOwnerMemberships.map((membership) => membership.userId)
  ).then((users) => users.filter((user): user is UserAsPersonal => !!user))

  await Promise.all(
    adminOwnerUsers.map(async (user) => {
      const role = adminOwnerMemberships.find(
        (membership) => membership.userId === user.id
      )?.role as 'ADMIN' | 'OWNER'

      const mailmanInput: DispatchEmailInput<NotifyDowngradeFreeTierData> = {
        template: 'notify-downgrade-free-tier',
        to: user.email,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
        data: {
          targetName: `${user.firstName} ${user.lastName}`,
          role,
          workspaceName: updatedTeam.name,
        },
      }

      return dispatchEmail(mailmanInput)
    })
  )

  return updatedTeam
}

const handleDeactivationUser = async (userId: string) => {
  const freePlanInfo = await getFreePlanInfo()

  const updatedUser = await UserModel.update(userId, {
    planInfoId: freePlanInfo.id,
    pastDue: false,
  })

  const mailmanInput: DispatchEmailInput<NotifyDowngradeFreeTierData> = {
    template: 'notify-downgrade-free-tier',
    to: updatedUser.email,
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

  await dispatchEmail(mailmanInput)
}
