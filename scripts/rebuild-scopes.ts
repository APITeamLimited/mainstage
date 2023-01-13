import { userAsPersonal } from '@apiteam/types'
import { PlanInfo } from '@prisma/client'
import { getFreePlanInfo } from 'api/src/helpers/billing'
import { createPersonalScope, createTeamScope } from 'api/src/helpers/scopes'
import { db } from 'api/src/lib/db'
import { getCoreCacheReadRedis } from 'api/src/lib/redis'
import { PlanInfoModel, TeamModel } from 'api/src/models'

export default async () => {
  console.log('Rebuilding scopes...')

  let offset = 0
  let batchSize = 100

  do {
    const users = await db.user.findMany({
      take: 100,
      skip: offset,
    })

    offset += users.length
    batchSize = users.length

    for (const user of users) {
      await (await getCoreCacheReadRedis()).del(`scope__userId:${user.id}`)

      console.log('Rebuilding scopes for user: ' + user.email)

      let planInfo = null as PlanInfo | null
      if (user.planInfoId) {
        planInfo = await PlanInfoModel.get(user.planInfoId)
      } else {
        planInfo = await getFreePlanInfo()
      }

      if (!planInfo) {
        throw new Error('No plan info found')
      }

      await createPersonalScope(userAsPersonal(user), planInfo, true)

      const memberships = await db.membership.findMany({
        where: {
          userId: user.id,
        },
      })

      for (const membership of memberships) {
        const team = await TeamModel.get(membership.teamId)

        if (!team) {
          throw new Error('No team found')
        }

        let planInfo = null as PlanInfo | null
        if (user.planInfoId) {
          planInfo = await PlanInfoModel.get(user.planInfoId)
        } else {
          planInfo = await getFreePlanInfo()
        }

        if (!planInfo) {
          throw new Error('No plan info found')
        }

        await createTeamScope(team, membership, user, planInfo, true)
      }
    }
  } while (batchSize > 0)

  console.log('Scopes rebuilt')
}
