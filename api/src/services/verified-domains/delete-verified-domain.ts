import { VerifiedDomain } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { deleteVerifiedDomainRedis } from 'src/helpers/verified-domains'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

import { checkOwnerAdmin } from '../teams/validators'

export const deleteVerifiedDomain = async ({
  verifiedDomainId,
  teamId,
}: {
  verifiedDomainId: string
  teamId: string | null
}) => {
  if (teamId) await checkOwnerAdmin({ teamId })

  const verifiedDomainRaw = await coreCacheReadRedis.get(
    `verifiedDomain__id:${verifiedDomainId}`
  )

  if (!verifiedDomainRaw) {
    throw new ServiceValidationError(
      'Verified domain not found in your workspace.'
    )
  }

  const verifiedDomain = JSON.parse(verifiedDomainRaw) as VerifiedDomain

  if (verifiedDomain.variant === 'TEAM') {
    if (verifiedDomain.variantTargetId !== teamId) {
      throw new ServiceValidationError(
        'Verified domain not found in your workspace.'
      )
    }
  } else {
    if (verifiedDomain.variantTargetId !== context.currentUser?.id) {
      throw new ServiceValidationError(
        'Verified domain not found in your workspace.'
      )
    }
  }

  await Promise.all([
    db.verifiedDomain.delete({
      where: { id: verifiedDomainId },
    }),
    deleteVerifiedDomainRedis(verifiedDomain),
  ])

  return verifiedDomain
}
