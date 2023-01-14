import { NotifyTeamDeletedData } from '@apiteam/mailman'
import {
  APITeamModel,
  GetAllAsyncIteratorMixin,
  GetOrCreateCustomerIdMixin,
  UserAsPersonal,
} from '@apiteam/types'
import type { Prisma, Team, Membership } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { createMembership } from 'src/helpers'
import { getFreePlanInfo } from 'src/helpers/billing'
import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { dispatchEmail } from 'src/lib/mailman'
import { getCoreCacheReadRedis, getCreditsReadRedis } from 'src/lib/redis'
import { scanPatternDelete } from 'src/utils'
import { checkSlugAvailable } from 'src/validators'

import { CustomerModel } from '../billing'
import { InvitationModel } from '../invitation'
import { ScopeModel } from '../scope'
import { UserModel } from '../user'

import {
  createFreeCredits,
  deleteMembershipRedis,
  rebuildMembershipsCache,
  setTeamRedis,
} from './redis-helpers'
import { handleTeamUpdate } from './update'

export type AbstractCreateTeamInput = {
  name: string
  slug: string
  owner: UserAsPersonal
}

export type AbstractUpdateTeamInput = Omit<
  Prisma.TeamUncheckedUpdateInput,
  'name' | 'planInfoId'
> & {
  name?: string
  planInfoId?: string
}

// Memberships aren't independent enough to justify their own model
type MembershipsMixin = {
  getOwnerMembership: (teamId: string) => Promise<Membership>
  getAdminOwnerMemberships: (teamId: string) => Promise<Membership[]>
  getAllMemberships: (teamId: string) => Promise<Membership[]>
  deleteMembership: (membershipId: string) => Promise<Membership>
}

export const TeamModel: APITeamModel<
  AbstractCreateTeamInput,
  AbstractUpdateTeamInput,
  Team
> &
  GetAllAsyncIteratorMixin<Team> &
  GetOrCreateCustomerIdMixin &
  MembershipsMixin = {
  create: async (input) => {
    // Check name not empty and length at least 5 chars

    await checkSlugAvailable(input.slug)

    const freePlanInfo = await getFreePlanInfo()

    let createdTeam = await db.team.create({
      data: {
        name: input.name,
        slug: input.slug,
        planInfoId: freePlanInfo.id,
      },
    })

    const customer = await CustomerModel.create({
      email: input.owner.email,
      variant: 'TEAM',
      variantTargetId: createdTeam.id,
      name: createdTeam.name,
    })

    createdTeam = await db.team.update({
      where: {
        id: createdTeam.id,
      },
      data: {
        customerId: customer.id,
      },
    })

    await Promise.all([
      createMembership(createdTeam, input.owner, 'OWNER'),
      setTeamRedis(createdTeam, 'CREATE'),

      // Add initial free credits
      createFreeCredits(createdTeam.id, freePlanInfo, createdTeam.pastDue),
    ])

    return createdTeam
  },
  update: handleTeamUpdate,
  delete: async (id) => {
    // Ensure team exists first as this is a complex operation
    const teamInfo = await db.team.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        customerId: true,
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

    const ownerMembership = await TeamModel.getOwnerMembership(id)

    const users = await db.user.findMany({
      where: {
        id: {
          in: memberships.map((m) => m.userId),
        },
      },
    })

    const scopes = await db.scope.findMany({
      where: {
        variant: 'TEAM',
        variantTargetId: id,
      },
    })

    await Promise.all(
      memberships.map((membership) => TeamModel.deleteMembership(membership.id))
    )

    await Promise.all(scopes.map((scope) => ScopeModel.delete(scope.id)))

    const creditsReadRedis = await getCreditsReadRedis()
    const coreCacheReadRedis = await getCoreCacheReadRedis()

    await creditsReadRedis.del(`team:${id}:freeCredits`)
    await creditsReadRedis.del(`team:${id}:maxFreeCredits`)
    await creditsReadRedis.del(`team:${id}:paidCredits`)

    await Promise.all([
      // Delete the customer if it exists
      teamInfo.customerId
        ? CustomerModel.delete(teamInfo.customerId)
        : Promise.resolve(),

      // Broadcast team deletion to other services
      coreCacheReadRedis.publish('TEAM_DELETED', id),
      coreCacheReadRedis.del(`team:${id}`),

      // Delete credits
      await creditsReadRedis.del(`team:${id}`),

      // Notify all members of team deletion
      ...users.map(async (user) =>
        dispatchEmail({
          to: user.email,
          template: 'notify-team-deleted',
          data: {
            teamName: teamInfo.name,
            targetName: user.firstName,
            wasOwner: user.id === ownerMembership.userId,
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
    const rawTeam = await (
      await getCoreCacheReadRedis()
    ).hGet(`team:${id}`, 'team')
    return !!rawTeam
  },
  get: async (id) => {
    const rawTeam = await (
      await getCoreCacheReadRedis()
    ).hGet(`team:${id}`, 'team')
    return rawTeam ? JSON.parse(rawTeam) : null
  },
  getMany: async (ids) => {
    return Promise.all(ids.map(TeamModel.get))
  },
  rebuildCache: async () => {
    await scanPatternDelete('team:*', await getCoreCacheReadRedis())

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

    // Can only rebuild memberships cache after teams cache is rebuilt
    await rebuildMembershipsCache()
  },
  getOrCreateCustomerId: async (id: string) => {
    const team = await TeamModel.get(id)

    if (!team) {
      throw new Error(`Team with id ${id} not found`)
    }

    if (team.customerId) {
      return team.customerId
    }

    const ownerMembership = await TeamModel.getOwnerMembership(team.id)
    const ownerUser = await UserModel.get(ownerMembership.userId)

    if (!ownerUser) {
      throw new Error(`User with id ${ownerMembership.userId} not found`)
    }

    const customer = await CustomerModel.create({
      email: ownerUser.email,
      variant: 'TEAM',
      variantTargetId: team.id,
      name: team.name,
    })

    await TeamModel.update(id, {
      customerId: customer.id,
    })

    return customer.id
  },
  getAllMemberships: async (teamId) => {
    const rawTeamAll = await (
      await getCoreCacheReadRedis()
    ).hGetAll(`team:${teamId}`)

    const memberships = [] as Membership[]

    Object.entries(rawTeamAll).map(([key, value]) => {
      if (key.startsWith('membership:')) {
        memberships.push(JSON.parse(value) as Membership)
      }
    })

    return memberships
  },
  getOwnerMembership: async (teamId) => {
    const ownerMembership = (await TeamModel.getAllMemberships(teamId)).find(
      (membership) => membership.role === 'OWNER'
    )

    if (!ownerMembership) {
      throw new Error(
        `Team with id ${teamId} does not have an owner, please contact support`
      )
    }

    return ownerMembership
  },
  getAllAsyncIterator: async function* () {
    // Iterate over all users in the database
    let skip = 0
    let batchSize = 0

    do {
      const teams = await db.team.findMany({
        skip,
        take: 100,
      })

      for (const team of teams) {
        yield team
      }

      skip += teams.length
      batchSize = teams.length
    } while (batchSize > 0)
  },
  getAdminOwnerMemberships: async (teamId) => {
    const allMemerships = await TeamModel.getAllMemberships(teamId)

    return allMemerships.filter(
      (membership) => membership.role === 'OWNER' || membership.role === 'ADMIN'
    )
  },
  deleteMembership: async (membershipId) => {
    const membershipDeleted = await db.membership.delete({
      where: {
        id: membershipId,
      },
    })

    await deleteMembershipRedis(membershipDeleted)

    const scope = await db.scope.findFirst({
      where: {
        variant: 'TEAM',
        variantTargetId: membershipDeleted.id,
      },
      select: {
        id: true,
      },
    })

    if (scope) {
      await ScopeModel.delete(scope.id)
    }

    return membershipDeleted
  },
}
