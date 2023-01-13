import { VerifiedDomain } from '@prisma/client'

import { getCoreCacheReadRedis } from 'src/lib/redis'

export const setVerifiedDomainRedis = async (
  verifiedDomain: VerifiedDomain
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await Promise.all([
    coreCacheReadRedis.set(
      `verifiedDomain__id:${verifiedDomain.id}`,
      JSON.stringify(verifiedDomain)
    ),
    coreCacheReadRedis.sAdd(
      `verifiedDomain__domain:${verifiedDomain.domain}`,
      verifiedDomain.id
    ),
    coreCacheReadRedis.sAdd(
      `verifiedDomain__variant:${verifiedDomain.variant}__variantTargetId:${verifiedDomain.variantTargetId}`,
      verifiedDomain.id
    ),
  ])
}

export const deleteVerifiedDomainRedis = async (
  verifiedDomain: VerifiedDomain
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  await Promise.all([
    coreCacheReadRedis.del(`verifiedDomain__id:${verifiedDomain.id}`),
    coreCacheReadRedis.sRem(
      `verifiedDomain__domain:${verifiedDomain.domain}`,
      verifiedDomain.id
    ),
    coreCacheReadRedis.sRem(
      `verifiedDomain__variant:${verifiedDomain.variant}__variantTargetId:${verifiedDomain.variantTargetId}`,
      verifiedDomain.id
    ),
  ])
}
