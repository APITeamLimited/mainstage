import {
  ConfirmChangeOwnerData,
  NotifyOldOwnerData,
  NotifyNewOwnerData,
} from '@apiteam/mailman'
import { UserAsPersonal } from '@apiteam/types-commonjs'
import { Team } from '@prisma/client'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from '../../../config'
import { updateMembership } from '../../../helpers'
import {
  changeOwnerAudience,
  generateBlanketUnsubscribeUrl,
  generateChangeOwnerUrl,
  generateUserUnsubscribeUrl,
} from '../../../helpers/routing'
import { db } from '../../../lib/db'
import { dispatchEmail } from '../../../lib/mailman'
import { CustomerModel } from '../../../models'
import { UserModel } from '../../../models/user'
import { getKeyPair } from '../../../services/bearer/bearer'
import { checkOwner } from '../../../services/guards'

const issuer = checkValue<string>('api.bearer.issuer')

export const sendChangeTeamOwnerEmail = async ({
  userId,
  teamId,
}: {
  userId: string
  teamId: string
}) => {
  await checkOwner({ teamId })

  if (!context.currentUser) {
    throw new ServiceValidationError('You must be logged in to do this.')
  }

  // Ensure userId is admin in team
  const user = await UserModel.get(userId)

  if (!user) {
    throw new ServiceValidationError(`User does not exist with id '${userId}'`)
  }

  const team = await db.team.findUnique({
    where: { id: teamId },
  })

  if (!team) {
    throw new ServiceValidationError(`Team does not exist with id '${teamId}'`)
  }

  const membership = await db.membership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: userId },
    },
  })

  if (!membership) {
    throw new ServiceValidationError(
      `User with id '${user.id}' was not found in your team`
    )
  }

  if (membership.role !== 'ADMIN') {
    throw new ServiceValidationError(
      `User with id '${user.id}' is not an admin in your team`
    )
  }

  await dispatchEmail({
    template: 'confirm-change-owner',
    to: context.currentUser.email,
    data: {
      newOwnerFirstname: user.firstName,
      newOwnerLastname: user.lastName,
      newOwnerEmail: user.email,
      teamName: team.name,
      changeOwnerLink: await generateChangeOwnerUrl(
        teamId,
        team.name,
        user.email,
        membership.id
      ),
      targetName: context.currentUser.firstName,
    } as ConfirmChangeOwnerData,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
  })

  return true
}

export const handleChangeOwner = async ({ token }: { token: string }) => {
  const { publicKey } = await getKeyPair()

  let decodedToken:
    | (JWT.Jwt & {
        payload: JWT.JwtPayload & {
          teamId: string
          teamName: string
          newOwnerEmail: string
          membershipId: string
        }
      })
    | undefined

  try {
    decodedToken = JWT.verify(token, publicKey, {
      issuer,
      audience: changeOwnerAudience,
      complete: true,
    }) as JWT.Jwt & {
      payload: JWT.JwtPayload & {
        teamId: string
        teamName: string
        newOwnerEmail: string
        membershipId: string
      }
    }
  } catch (error) {
    throw new ServiceValidationError('Invalid token')
  }

  const newOwnerMembership = await db.membership.findFirst({
    where: {
      id: decodedToken.payload.membershipId,
    },
  })

  if (!newOwnerMembership) {
    throw new Error('New owner membership not found')
  }

  const oldOwnerMembership = await db.membership.findFirst({
    where: {
      teamId: decodedToken.payload.teamId,
      role: 'OWNER',
    },
  })

  if (!oldOwnerMembership) {
    throw new Error('Old owner membership not found')
  }

  const newOwner = await db.user.findUnique({
    where: { id: newOwnerMembership.userId },
  })

  if (!newOwner) {
    throw new Error('New owner not found')
  }

  const oldOwner = await db.user.findUnique({
    where: { id: oldOwnerMembership.userId },
  })

  if (!oldOwner) {
    throw new Error('Old owner not found')
  }

  const team = await db.team.findUnique({
    where: { id: decodedToken.payload.teamId },
  })

  if (!team) {
    throw new Error('Team not found')
  }

  await Promise.all([
    checkIfNeedChangeCustomerEmail(oldOwner, newOwner, team),

    updateMembership(oldOwnerMembership, 'ADMIN', team, oldOwner),
    updateMembership(newOwnerMembership, 'OWNER', team, newOwner),
  ])

  await Promise.all([
    dispatchEmail({
      template: 'notify-new-owner',
      to: newOwner.email,
      data: {
        targetName: newOwner.firstName,
        teamName: team.name,
        oldOwnerName: oldOwner.firstName,
      } as NotifyNewOwnerData,
      userUnsubscribeUrl: await generateUserUnsubscribeUrl(newOwner),
      blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
        newOwner.email
      ),
    }),
    dispatchEmail({
      template: 'notify-old-owner',
      to: oldOwner.email,
      data: {
        targetName: oldOwner.firstName,
        teamName: team.name,
        newOwnerName: newOwner.firstName,
      } as NotifyOldOwnerData,
      userUnsubscribeUrl: await generateUserUnsubscribeUrl(oldOwner),
      blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
        oldOwner.email
      ),
    }),
  ])

  return true
}

const checkIfNeedChangeCustomerEmail = async (
  oldOwner: UserAsPersonal,
  newOwner: UserAsPersonal,
  team: Team
) => {
  if (!team.customerId) {
    return
  }

  const customer = await CustomerModel.get(team.customerId)

  if (!customer) {
    throw new Error('Customer not found')
  }

  if (customer.email === oldOwner.email) {
    await CustomerModel.update(team.customerId, {
      email: newOwner.email,
    })
  }
}
