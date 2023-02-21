import { getCreditsReadRedis } from '../../lib/redis'

import { checkAuthenticated, checkMember } from '../guards'

type CreditsInfo = {
  freeCredits: number
  maxFreeCredits: number
  paidCredits: number
}

export const credits = async ({
  teamId,
}: {
  teamId?: string
}): Promise<CreditsInfo> => {
  const userId = (await checkAuthenticated()).id

  if (teamId) {
    await checkMember({ teamId })
  }

  const workspaceName = teamId ? `TEAM:${teamId}` : `USER:${userId}`

  const creditsReadRedis = await getCreditsReadRedis()

  const [freeCredits, maxFreeCredits, paidCredits] = await Promise.all([
    creditsReadRedis.get(`${workspaceName}:freeCredits`),
    creditsReadRedis.get(`${workspaceName}:maxFreeCredits`),
    creditsReadRedis.get(`${workspaceName}:paidCredits`),
  ])

  if (!freeCredits || !maxFreeCredits) {
    throw new Error('Credits info not found please contact support')
  }

  return {
    freeCredits: parseInt(freeCredits),
    maxFreeCredits: parseInt(maxFreeCredits),
    paidCredits: parseInt(paidCredits ?? '0'),
  }
}
