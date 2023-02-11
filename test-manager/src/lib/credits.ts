import type { Scope } from '@prisma/client'

import { getCreditsReadRedis } from './redis'

export const getAvailableCredits = async (scope: Scope): Promise<number> => {
  const creditsReadRedis = await getCreditsReadRedis()

  const [freeCredits, paidCredits] = await Promise.all([
    creditsReadRedis.get(
      `${scope.variant}:${scope.variantTargetId}:freeCredits`
    ),
    creditsReadRedis.get(
      `${scope.variant}:${scope.variantTargetId}:paidCredits`
    ),
  ])

  return (
    (freeCredits ? parseInt(freeCredits, 10) : 0) +
    (paidCredits ? parseInt(paidCredits, 10) : 0)
  )
}
