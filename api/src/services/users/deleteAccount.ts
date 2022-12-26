import { ConfirmAccountDeleteData } from '@apiteam/mailman'
import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import {
  deleteAccountAudience,
  generateBlanketUnsubscribeUrl,
  generateDeleteAccountUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { UserModel } from 'src/models/user'
import { getKeyPair } from 'src/services/bearer/bearer'

const issuer = checkValue<string>('api.bearer.issuer')

export const sendAccountDeleteEmail = async () => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  // Ensure user not a team owner
  const teamOwner = await db.membership.findFirst({
    where: {
      userId: context.currentUser.id,
      role: 'OWNER',
    },
  })

  if (teamOwner) {
    throw new ServiceValidationError(
      'You cannot delete your account while you are a team owner.'
    )
  }

  await dispatchEmail({
    to: context.currentUser.email,
    template: 'confirm-account-delete',
    data: {
      deleteLink: await generateDeleteAccountUrl(context.currentUser.id),
      targetName: context.currentUser.firstName,
    } as ConfirmAccountDeleteData,
    userUnsubscribeUrl: await generateUserUnsubscribeUrl(context.currentUser),
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
      context.currentUser.email
    ),
  })

  return true
}

export const handleAccountDelete = async ({ token }: { token: string }) => {
  const { publicKey } = await getKeyPair()

  let decodedToken:
    | (JWT.Jwt & {
        payload: JWT.JwtPayload & {
          userId: string
        }
      })
    | undefined

  try {
    decodedToken = JWT.verify(token, publicKey, {
      issuer,
      audience: deleteAccountAudience,
      complete: true,
    }) as JWT.Jwt & {
      payload: JWT.JwtPayload & {
        userId: string
      }
    }
  } catch (error) {
    throw new ServiceValidationError('Invalid token')
  }

  if (!decodedToken.payload.userId) {
    throw new ServiceValidationError('Invalid token')
  }

  await UserModel.delete(decodedToken.payload.userId)

  return true
}
