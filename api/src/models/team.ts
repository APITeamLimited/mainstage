import { NotifyTeamDeletedData } from '@apiteam/mailman'
import { APITeamModel, UserAsPersonal } from '@apiteam/types'
import { Prisma, Team } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { createMembership, createTeamScope } from 'src/helpers'
import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'
import { scanPatternDelete } from 'src/utils'
import { checkSlugAvailable } from 'src/validators/slug'

import { InvitationModel } from './invitation'
import { MembershipModel } from './membership'

export type AbstractCreateTeamInput = {
  name: string
  slug: string
  owner: UserAsPersonal
}

export const TeamModel: APITeamModel<
  AbstractCreateTeamInput,
  Prisma.TeamUpdateInput,
  Team
> = {
  create: async (input) => {
    // Check name not empty and length at least 5 chars

    await checkSlugAvailable(input.slug)

    const createdTeam = await db.team.create({
      data: {
        name: input.name,
        slug: input.slug,
      },
    })

    await createMembership(createdTeam, input.owner, 'OWNER')
    await setTeamRedis(createdTeam, 'CREATE')

    return createdTeam
  },
  update: async (id, input) => {
    const updatedTeam = await db.team.update({
      where: {
        id,
      },
      data: input,
    })

    await setTeamRedis(updatedTeam, 'UPDATE')

    const memberships = await db.membership.findMany({
      where: {
        teamId: id,
      },
    })

    const userIds = memberships.map((m) => m.userId)

    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    })

    // Call createTeamScope for each scope
    await Promise.all(
      memberships.map(async (membership) => {
        const user = users.find((u) => u.id === membership.userId)

        if (!user) {
          throw new Error(`User not found with id '${membership.userId}'`)
        }

        return createTeamScope(updatedTeam, membership, user)
      })
    )

    return updatedTeam
  },
  delete: async (id) => {
    // Ensure team exists first as this is a complex operation
    const teamInfo = await db.team.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
      },
    })

    if (!teamInfo) {
      throw new ServiceValidationError(`Team not found with id '${id}'`)
    }

    const invitations = await db.invitation.findMany({
      where: {
        teamId: id,
      },
      select: {
        id: true,
      },
    })

    await Promise.all(
      invitations.map((invitation) => InvitationModel.delete(invitation.id))
    )

    const memberships = await db.membership.findMany({
      where: {
        teamId: id,
      },
    })

    const users = await db.user.findMany({
      where: {
        id: {
          in: memberships.map((m) => m.userId),
        },
      },
    })

    await Promise.all(
      memberships.map((membership) => MembershipModel.delete(membership.id))
    )

    await Promise.all([
      // Broadcast team deletion to other services
      coreCacheReadRedis.publish('TEAM_DELETED', id),
      coreCacheReadRedis.del(`team:${id}`),

      // Notify all members of team deletion
      ...users.map(async (user) =>
        dispatchEmail({
          to: user.email,
          template: 'notify-team-deleted',
          data: {
            teamName: teamInfo.name,
            targetName: user.firstName,
            wasOwner: user.id === context.currentUser?.id,
          } as NotifyTeamDeletedData,
          userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
          blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
            user.email
          ),
        })
      ),
    ])

    return db.team.delete({
      where: {
        id,
      },
    })
  },
  exists: async (id) => {
    const rawTeam = await coreCacheReadRedis.get(`team__id:${id}`)
    return !!rawTeam
  },
  get: async (id) => {
    const rawTeam = await coreCacheReadRedis.get(id)
    return rawTeam ? JSON.parse(rawTeam) : null
  },
  rebuildCache: async () => {
    await scanPatternDelete('team:*', coreCacheReadRedis)

    let skip = 0
    let batchSize = 0

    do {
      const teams = await db.team.findMany({
        skip,
        take: 100,
      })

      await Promise.all(teams.map((team) => setTeamRedis(team, 'UPDATE')))

      skip += teams.length
      batchSize = teams.length
    } while (batchSize > 0)
  },
}

const setTeamRedis = async (team: Team, oppType: 'CREATE' | 'UPDATE') => {
  await coreCacheReadRedis.hSet(`team:${team.id}`, 'team', JSON.stringify(team))

  await coreCacheReadRedis.publish(
    `team:${team.id}`,
    JSON.stringify({
      type: oppType,
      payload: team,
    })
  )
}
