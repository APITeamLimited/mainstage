import { User, Membership, Team } from '@prisma/client'
import { Scope } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

/*
Creates or updates an existing personal scope with latest user data.
*/
export const createPersonalScope = async (user: User) => {
  const role = null
  const displayName = `${user.firstName} ${user.lastName}`
  const profilePicture = user.profilePicture

  const getLatestScope = async () => {
    const existingScopesRaw = await coreCacheReadRedis.hGetAll(
      `scope__userId:${user.id}`
    )

    const existingScopes = Object.values(existingScopesRaw).map(
      (rawScope) => JSON.parse(rawScope) as Scope
    )

    const existingScope =
      existingScopes.find(
        (scope) => scope.variant === 'USER' && scope.variantTargetId === user.id
      ) || null

    if (existingScope) {
      // If details different than existing scope, update existing scope
      if (
        existingScope.role !== role ||
        existingScope.displayName !== displayName ||
        existingScope.profilePicture !== profilePicture
      ) {
        const updatedScope = await db.scope.update({
          where: {
            id: existingScope.id,
          },
          data: {
            role,
            displayName,
            profilePicture,
            updatedAt: new Date(),
          },
        })

        return {
          scope: updatedScope,
          changed: true,
        }
      }
      return {
        scope: existingScope,
        changed: false,
      }
    }

    // Create new scope
    const newScope = await db.scope.create({
      data: {
        variant: 'USER',
        variantTargetId: user.id,
        role,
        userId: user.id,
        displayName,
        profilePicture,
      },
    })

    return {
      scope: newScope,
      changed: true,
    }
  }

  const { scope, changed } = await getLatestScope()

  if (changed) {
    await coreCacheReadRedis.set(`scope__id:${scope.id}`, JSON.stringify(scope))
    await coreCacheReadRedis.publish(
      `scope__id:${scope.id}`,
      JSON.stringify(scope)
    )
    await coreCacheReadRedis.hSet(
      `scope__userId:${user.id}`,
      scope.id,
      JSON.stringify(scope)
    )
    await coreCacheReadRedis.publish(
      `scope__userId:${user.id}`,
      JSON.stringify(scope)
    )
  }

  return scope
}

/*
Creates or updates an existing team scope with latest team data.
*/
export const createTeamScope = async (
  team: Team,
  membership: Membership,
  user: User
) => {
  const role = membership.role
  const displayName = team.name
  const profilePicture = team.profilePicture

  const getLatestScope = async () => {
    const existingScope = await db.scope.findFirst({
      where: {
        variant: 'TEAM',
        variantTargetId: team.id,
        userId: user.id,
      },
    })

    if (existingScope) {
      // If details different than existing scope, update existing scope
      if (
        existingScope.role !== role ||
        existingScope.displayName !== displayName ||
        existingScope.profilePicture !== profilePicture
      ) {
        const updatedScope = await db.scope.update({
          where: {
            id: existingScope.id,
          },
          data: {
            role,
            displayName,
            profilePicture,
            updatedAt: new Date(),
          },
        })

        return {
          scope: updatedScope,
          changed: true,
        }
      }
      return {
        scope: existingScope,
        changed: false,
      }
    }

    // Create new scope
    const newScope = await db.scope.create({
      data: {
        variant: 'TEAM',
        variantTargetId: team.id,
        role,
        userId: user.id,
        displayName,
        profilePicture,
      },
    })

    return {
      scope: newScope,
      changed: true,
    }
  }

  const { scope, changed } = await getLatestScope()

  if (changed) {
    await coreCacheReadRedis.set(`scope__id:${scope.id}`, JSON.stringify(scope))
    await coreCacheReadRedis.publish(
      `scope__id:${scope.id}`,
      JSON.stringify(scope)
    )
    await coreCacheReadRedis.hSet(
      `scope__userId:${user.id}`,
      scope.id,
      JSON.stringify(scope)
    )
    await coreCacheReadRedis.publish(
      `scope__userId:${user.id}`,
      JSON.stringify(scope)
    )
  }

  return scope
}

export const deleteScope = async (scopeId: string) => {
  const scope = await db.scope.findFirst({
    where: {
      id: scopeId,
    },
  })

  if (!scope) {
    return
  }

  await db.scope.delete({
    where: {
      id: scopeId,
    },
  })

  await coreCacheReadRedis.del(`scope__id:${scopeId}`)
  await coreCacheReadRedis.del(`scope__userId:${scope.userId}`)
  await coreCacheReadRedis.publish(`scope__id:${scopeId}`, 'DELETED')
  await coreCacheReadRedis.publish(`scope__userId:${scope.userId}`, 'DELETED')
}
