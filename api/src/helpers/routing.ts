import { UserAsPersonal } from '@apiteam/types'
import { ROUTES } from '@apiteam/types'
import JWT from 'jsonwebtoken'

import { checkValue } from 'src/config'
import { getKeyPair } from 'src/services/bearer/bearer'

const gateway = checkValue<string>('gateway.url')

const issuer = checkValue<string>('api.bearer.issuer')

export const userUnsubscribeAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-user-unsubscribe`

export const generateUserUnsubscribeUrl = async (user: UserAsPersonal) => {
  const { privateKey } = await getKeyPair()

  const token = JWT.sign(
    {
      userId: user.id,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: userUnsubscribeAudience,
      expiresIn: 60 * 60 * 24 * 365.25 * 100,
    }
  )

  return `${gateway}${ROUTES.userUnsubscribe}?token=${token}`
}

export const blanketUnsubscribeAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-blanket-unsubscribe`

export const generateBlanketUnsubscribeUrl = async (email: string) => {
  const { privateKey } = await getKeyPair()

  const token = JWT.sign(
    {
      email,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: blanketUnsubscribeAudience,
      expiresIn: 60 * 60 * 24 * 365.25 * 100,
    }
  )

  console.log('g')

  return `${gateway}${ROUTES.blanketUnsubscribe}?token=${token}`
}

export const acceptInvitationAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-accept-invitation`

export const generateAcceptInvitationUrl = async (
  invitationId: string,
  teamName: string,
  invitationEmail: string
) => {
  const { privateKey } = await getKeyPair()

  const token = JWT.sign(
    {
      invitationId,
      teamName,
      invitationEmail,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: acceptInvitationAudience,
      expiresIn: 60 * 60 * 24 * 365.25 * 100,
    }
  )

  return `${gateway}${ROUTES.acceptInvitation}?token=${token}`
}

export const declineInvitationAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-decline-invitation`

export const generateDeclineInvitationUrl = async (
  invitationId: string,
  teamName: string,
  invitationEmail: string
) => {
  const { privateKey } = await getKeyPair()

  const token = JWT.sign(
    {
      invitationId,
      teamName,
      invitationEmail,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: declineInvitationAudience,
      expiresIn: 60 * 60 * 24 * 365.25 * 100,
    }
  )

  return `${gateway}${ROUTES.declineInvitation}?token=${token}`
}

export const deleteTeamAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-delete-team`

export const generateDeleteTeamUrl = async (
  teamId: string,
  teamName: string
) => {
  const { privateKey } = await getKeyPair()

  const token = JWT.sign(
    {
      teamId,
      teamName,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: deleteTeamAudience,
      expiresIn: 60 * 15,
    }
  )

  return `${gateway}${ROUTES.deleteTeam}?token=${token}`
}

export const deleteAccountAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-delete-account`

export const generateDeleteAccountUrl = async (userId: string) => {
  const { privateKey } = await getKeyPair()

  const token = JWT.sign(
    {
      userId,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: deleteAccountAudience,
      expiresIn: 60 * 15,
    }
  )

  return `${gateway}${ROUTES.deleteAccount}?token=${token}`
}

export const changeOwnerAudience = `${checkValue<string>(
  'api.bearer.audience'
)}-change-owner`

export const generateChangeOwnerUrl = async (
  teamId: string,
  teamName: string,
  newOwnerEmail: string,
  membershipId: string
) => {
  const { privateKey } = await getKeyPair()

  const token = JWT.sign(
    {
      teamId,
      teamName,
      newOwnerEmail,
      membershipId,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: changeOwnerAudience,
      expiresIn: 60 * 15,
    }
  )

  return `${gateway}${ROUTES.changeOwner}?token=${token}`
}
