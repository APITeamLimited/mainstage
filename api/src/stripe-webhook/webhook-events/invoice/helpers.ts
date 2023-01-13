import { UserAsPersonal } from '@apiteam/types'
import { Membership, Team } from '@prisma/client'
import type { Stripe } from 'stripe'

import { stripe } from 'src/lib/stripe'
import { UserModel, TeamModel } from 'src/models'

export const getInvoiceLast4 = async (invoice: Stripe.Invoice) => {
  const paymentIntent =
    typeof invoice.payment_intent === 'string'
      ? await stripe.paymentIntents.retrieve(invoice.payment_intent)
      : invoice.payment_intent

  if (!paymentIntent) {
    throw new Error(`Payment intent not found: ${invoice.payment_intent}`)
  }

  const paymentMethod = await stripe.paymentMethods.retrieve(
    paymentIntent.payment_method as string
  )

  if (!paymentMethod.card) {
    throw new Error(`Payment method not found: ${paymentIntent.payment_method}`)
  }

  return paymentMethod.card.last4
}

export const getAdminOwnerSendInfo = async (
  variant: 'TEAM' | 'USER',
  variantTargetId: string
): Promise<{
  users: UserAsPersonal[]
  adminOwnerMemberships: Membership[]
  team: Team | null
}> => {
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

  const users = (await UserModel.getMany(toSendUserIds)).filter(
    (user): user is UserAsPersonal => !!user
  )

  return {
    users,
    adminOwnerMemberships,
    team,
  }
}
