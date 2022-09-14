import { VerifiedDomain } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { coreCacheReadRedis } from 'src/lib/redis'

import { checkMember } from '../teams/validators/check-member'

export const verifiedDomains = async ({
  teamId,
}: {
  teamId: string | null
}) => {
  if (teamId) await checkMember({ teamId })
  if (!context.currentUser) throw new ServiceValidationError('Not logged in.')

  const variant = teamId ? 'TEAM' : 'USER'
  const variantTargetId = teamId ?? context.currentUser.id

  const verifiedDomainIds = (
    await coreCacheReadRedis.sMembers(
      `verifiedDomain__variant:${variant}__variantTargetId:${variantTargetId}`
    )
  ).map((id) => `verifiedDomain__id:${id}`)

  const verifiedDomains = (
    verifiedDomainIds.length > 0
      ? await coreCacheReadRedis.mGet(verifiedDomainIds)
      : []
  )
    .filter((verifiedDomain) => verifiedDomain !== null)
    .map((verifiedDomain) =>
      JSON.parse(verifiedDomain as string)
    ) as VerifiedDomain[]

  return verifiedDomains
}
