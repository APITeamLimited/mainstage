import { NotifyAccountDeletedData, SignupWelcomeData } from '@apiteam/mailman'
import {
  APITeamModel,
  GetAllAsyncIteratorMixin,
  IndexedFieldMixin,
  ROUTES,
  UserAsPersonal,
  userAsPersonal,
  GetOrCreateCustomerIdMixin,
} from '@apiteam/types'
import type { Prisma, User, PlanInfo } from '@prisma/client'
import { url as gravatarUrl } from 'gravatar'

import { ServiceValidationError } from '@redwoodjs/api'

import {
  createPersonalScope,
  createTeamScope,
  deleteMembership,
} from 'src/helpers'
import { getFreePlanInfo } from 'src/helpers/billing'
import {
  generateBlanketUnsubscribeUrl,
  generateUserUnsubscribeUrl,
} from 'src/helpers/routing'
import { db } from 'src/lib/db'
import { gatewayUrl } from 'src/lib/environment'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis, creditsReadRedis } from 'src/lib/redis'
import { scanPatternDelete } from 'src/utils'

import { CustomerModel, CustomerUpdateInput, PlanInfoModel } from './billing'
import { ScopeModel } from './scope'

type GetDangerousMixin<ObjectType> = {
  getDangerous: (id: string) => Promise<ObjectType | null>
}

export type AbstractUserCreateInput = Omit<
  Prisma.UserUncheckedCreateInput,
  'planInfoId'
> & {
  planInfoId?: string
}

export type AbstractUserUpdateInput = Omit<
  Prisma.UserUncheckedUpdateInput,
  'email' | 'planInfoId'
> & {
  email?: string
  planInfoId?: string
}

export const UserModel: APITeamModel<
  AbstractUserCreateInput,
  AbstractUserUpdateInput,
  UserAsPersonal
> &
  GetDangerousMixin<User> &
  IndexedFieldMixin<UserAsPersonal, 'id' | 'email'> &
  GetAllAsyncIteratorMixin<User> &
  GetOrCreateCustomerIdMixin = {
  create: async (input) => {
    if (!input.profilePicture) {
      input.profilePicture = gravatarUrl(input.email, {
        default: 'mp',
      })
    }

    const freePlanInfo = await getFreePlanInfo()
    input.planInfoId = freePlanInfo.id

    const createdUser = await db.user.create({
      data: input,
    })

    await Promise.all([
      setUserRedis(createdUser),
      createPersonalScope(userAsPersonal(createdUser), freePlanInfo),

      // Add initial free credits
      await createFreeCredits(
        createdUser.id,
        freePlanInfo,
        createdUser.pastDue
      ),

      dispatchEmail({
        to: createdUser.email,
        template: 'signup-welcome',
        data: {
          firstName: createdUser.firstName,
          dashboardLink: `${gatewayUrl}${ROUTES.dashboard}`,
        } as SignupWelcomeData,
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(
          createdUser.email
        ),
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(createdUser),
      }),
    ])

    return createdUser
  },
  update: async (id, input) => {
    const updatedUser = await db.user.update({
      where: { id },
      data: input,
    })

    if ('planInfoId' in input && input.planInfoId) {
      const planInfo = await PlanInfoModel.get(input.planInfoId)

      if (!planInfo) {
        throw new ServiceValidationError(
          `PlanInfo not found with id '${input.planInfoId}'`
        )
      }

      // Update credits
      await createFreeCredits(updatedUser.id, planInfo, updatedUser.pastDue)
    }

    // If email has changed, update the email on the customer
    if (updatedUser.customerId) {
      const oldUser = await UserModel.get(id)

      if (!oldUser) {
        throw new Error(`User with id ${id} not found`)
      }

      const customer = await CustomerModel.get(updatedUser.customerId)

      if (!customer) {
        throw new Error(`Customer with id ${updatedUser.customerId} not found`)
      }

      const updatePayload = {} as CustomerUpdateInput

      // Check not using custom invoice email
      if (input.email && oldUser.email === customer.email) {
        updatePayload['email'] = input.email
      }

      if (
        ((input.firstName && oldUser.firstName !== input.firstName) ||
          (input.lastName && oldUser.lastName !== input.lastName)) &&
        customer.name === `${oldUser.firstName} ${oldUser.lastName}`
      ) {
        updatePayload['name'] = `${input.firstName} ${input.lastName}`
      }

      if (Object.keys(updatePayload).length > 0) {
        await CustomerModel.update(updatedUser.customerId, updatePayload)
      }
    }

    const memberships = await db.membership.findMany({
      where: {
        userId: id,
      },
    })

    const teams = await Promise.all(
      memberships.map((membership) =>
        db.team.findUnique({
          where: {
            id: membership.teamId,
          },
        })
      )
    )

    const planInfo = updatedUser.planInfoId
      ? await PlanInfoModel.get(updatedUser.planInfoId)
      : await getFreePlanInfo()

    if (!planInfo) {
      throw new Error(`PlanInfo not found with id ${updatedUser.planInfoId}`)
    }

    await Promise.all([
      setUserRedis(updatedUser),

      // Personal and team scopes will need updating
      createPersonalScope(userAsPersonal(updatedUser), planInfo),

      Promise.all([
        teams.map(async (team) => {
          if (!team) {
            throw new ServiceValidationError(
              `Team not found for user with id ${id}`
            )
          }

          const membership = memberships.find(
            (membership) => membership.teamId === team.id
          )

          if (!membership) {
            throw new ServiceValidationError(
              `Membership not found for user with id ${id} and team with id ${team.id}`
            )
          }

          const planInfo = team.planInfoId
            ? await PlanInfoModel.get(team.planInfoId)
            : await getFreePlanInfo()

          if (!planInfo) {
            throw new Error(
              `PlanInfo not found with id ${updatedUser.planInfoId}`
            )
          }

          return createTeamScope(team, membership, updatedUser, planInfo)
        }),
      ]),
    ])

    return updatedUser
  },
  delete: async (id) => {
    // Delete all membewrships and scopes
    const [scopes, memberships] = await Promise.all([
      db.scope.findMany({
        where: {
          userId: id,
        },
      }),
      db.membership.findMany({
        where: {
          userId: id,
        },
      }),
    ])

    // Delete memberships first
    await Promise.all(memberships.map(deleteMembership))

    await creditsReadRedis.del(`user:${id}:freeCredits`)
    await creditsReadRedis.del(`user:${id}:maxFreeCredits`)
    await creditsReadRedis.del(`user:${id}:paidCredits`)

    const user = await db.user.delete({
      where: { id },
    })

    await Promise.all([
      // Delete the customer if it exists
      user.customerId
        ? CustomerModel.delete(user.customerId)
        : Promise.resolve(),

      // Broadcast team deletion to other services
      coreCacheReadRedis.publish('USER_DELETED', user.id),

      // Delete the personal scope, the team one was deleted with the membership
      scopes.map((scope) => ScopeModel.delete(scope.id)),

      coreCacheReadRedis.del(`user__id:${user.id}`),
      coreCacheReadRedis.del(`user__email:${user.email}`),

      // Delete credits
      await creditsReadRedis.del(`user:${id}`),

      dispatchEmail({
        to: user.email,
        template: 'notify-account-deleted',
        data: {
          targetName: user.firstName,
        } as NotifyAccountDeletedData,
        userUnsubscribeUrl: await generateUserUnsubscribeUrl(user),
        blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(user.email),
      }),
    ])

    return user
  },
  exists: async (id) => {
    const rawUser = await coreCacheReadRedis.get(`user__id:${id}`)
    return !!rawUser
  },
  get: async (id: string) => {
    const rawUser = await coreCacheReadRedis.get(`user__id:${id}`)
    return rawUser ? userAsPersonal(JSON.parse(rawUser)) : null
  },
  getMany: async (ids: string[]) => {
    const rawUsers = await coreCacheReadRedis.mGet(
      ids.map((id) => `user__id:${id}`)
    )
    return rawUsers.map((rawUser) =>
      rawUser ? userAsPersonal(JSON.parse(rawUser)) : null
    )
  },
  rebuildCache: async () => {
    await Promise.all([
      coreCacheReadRedis.del('user'),
      scanPatternDelete('user__id:*', coreCacheReadRedis),
      scanPatternDelete('user__email:*', coreCacheReadRedis),
    ])

    let skip = 0
    let batchSize = 0

    do {
      const users = await db.user.findMany({
        skip,
        take: 100,
      })

      await Promise.all(users.map(setUserRedis))

      skip += users.length
      batchSize = users.length
    } while (batchSize > 0)
  },

  // Non-standard methods
  getDangerous: async (id: string) => {
    return db.user.findUnique({
      where: {
        id,
      },
    })
  },
  getIndexedField: async (field, key) => {
    const rawUser = await coreCacheReadRedis.get(`user__${field}:${key}`)
    return rawUser ? userAsPersonal(JSON.parse(rawUser)) : null
  },
  indexedFieldExists: async (field, key) => {
    const rawUser = await coreCacheReadRedis.get(`user__${field}:${key}`)
    return !!rawUser
  },
  getAllAsyncIterator: async function* () {
    // Iterate over all users in the database
    let skip = 0
    let batchSize = 0

    do {
      const users = await db.user.findMany({
        skip,
        take: 100,
      })

      for (const user of users) {
        yield user
      }

      skip += users.length
      batchSize = users.length
    } while (batchSize > 0)
  },
  getOrCreateCustomerId: async (id: string) => {
    const user = await UserModel.get(id)

    if (!user) {
      throw new Error(`User with id ${id} not found`)
    }

    if (user.customerId) {
      return user.customerId
    }

    const customer = await CustomerModel.create({
      email: user.email,
      variant: 'USER',
      variantTargetId: user.id,
      name: `${user.firstName} ${user.lastName}`,
    })

    await UserModel.update(id, {
      customerId: customer.id,
    })

    return customer.id
  },
}

const setUserRedis = async (user: User) => {
  const cachedUser = userAsPersonal(user)

  await coreCacheReadRedis.hSet('user', user.id, JSON.stringify(cachedUser))

  await coreCacheReadRedis.set(
    `user__id:${user.id}`,
    JSON.stringify(cachedUser)
  )

  await coreCacheReadRedis.publish(
    `user__id:${user.id}`,
    JSON.stringify(cachedUser)
  )

  await coreCacheReadRedis.set(
    `user__email:${user.email}`,
    JSON.stringify(cachedUser)
  )

  await coreCacheReadRedis.publish(
    `user__email:${user.email}`,
    JSON.stringify(cachedUser)
  )

  return cachedUser
}

const createFreeCredits = async (
  userId: string,
  planInfo: PlanInfo,
  pastDue: boolean
) => {
  if (pastDue) {
    // If the team is past due, don't add free credits
    return
  }

  await Promise.all([
    // Reset free credits
    creditsReadRedis.set(`user:${userId}:freeCredits`, planInfo.monthlyCredits),

    creditsReadRedis.set(
      `user:${userId}:maxFreeCredits`,
      planInfo.monthlyCredits
    ),

    UserModel.update(userId, {
      freeCreditsAddedAt: new Date(),
    }),
  ])
}
