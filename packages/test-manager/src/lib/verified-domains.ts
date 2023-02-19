import type { VerifiedDomain } from '@prisma/client'

import { getCoreCacheReadRedis } from './redis'

export const getVerifiedDomains = async (
  variant: string,
  variantTargetId: string
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

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
    .filter((verifiedDomain) => verifiedDomain.verified)
    .map((verifiedDomain) => verifiedDomain.domain)
}
