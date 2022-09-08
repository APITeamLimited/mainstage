import JWT from 'jsonwebtoken'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import { deleteInvitationRedis } from 'src/helpers/invitations'
import { declineInvitationAudience } from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { getKeyPair } from 'src/services/bearer/bearer'

const issuer = checkValue<string>('api.bearer.issuer')

export const declineInvitaiton = async ({ token }: { token: string }) => {
  const { publicKey } = await getKeyPair()

  let decodedToken: JWT.Jwt | undefined = undefined

  try {
    decodedToken = JWT.verify(token, publicKey, {
      issuer,
      audience: declineInvitationAudience,
      complete: true,
    })
  } catch (error) {
    throw new ServiceValidationError('Invalid token')
  }

  if (
    typeof decodedToken.payload === 'string' ||
    !decodedToken.payload?.email
  ) {
    throw new ServiceValidationError('Invalid token')
  }

  const invitation = await db.invitation.findUnique({
    where: {
      email: decodedToken.payload.email,
    },
  })

  if (!invitation || invitation.accepted) {
    throw new ServiceValidationError(
      'Invitation not found, it may have been deleted, declined or already accepted'
    )
  }

  await Promise.all([
    db.invitation.delete({
      where: {
        id: invitation.id,
      },
    }),
    deleteInvitationRedis(invitation),
  ])

  return true
}
