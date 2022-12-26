import { getDisplayName, SafeUser } from '@apiteam/types'
import { Membership, Team } from '@prisma/client'
import { Scope } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

/*
Creates or updates an existing personal scope with latest user data.
*/
export const createPersonalScope = async (user: SafeUser) => {
  const role = null
  const displayName = getDisplayName(user)
  const profilePicture = user.profilePicture
  const slug = user.slug

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
        existingScope.profilePicture !== profilePicture ||
        existingScope.slug !== slug
      ) {
        const updatedScope = await db.scope.update({
          where: {
            id: existingScope.id,
          },
          data: {
            role,
            displayName,
            slug,
            profilePicture,
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
        slug,
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
    await setScopeRedis(scope)
  }

  return scope
}

/*
Creates or updates an existing team scope with latest team data.
*/
export const createTeamScope = async (
  team: Team,
  membership: Membership,
  user: SafeUser
) => {
  const role = membership.role
  const displayName = team.name
  const profilePicture = team.profilePicture
  const slug = team.slug

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
        existingScope.profilePicture !== profilePicture ||
        existingScope.slug !== slug
      ) {
        const updatedScope = await db.scope.update({
          where: {
            id: existingScope.id,
          },
          data: {
            role,
            displayName,
            profilePicture,
            slug,
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
        slug: team.slug,
      },
    })

    return {
      scope: newScope,
      changed: true,
    }
  }

  const { scope, changed } = await getLatestScope()

  if (changed) {
    await setScopeRedis(scope)
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
  await coreCacheReadRedis.hDel(`scope__userId:${scope.userId}`, scopeId)
  await coreCacheReadRedis.publish(`scope__id:${scopeId}`, 'DELETED')
  await coreCacheReadRedis.publish(`scope__userId:${scope.userId}`, 'DELETED')
}

// Recreates all scopes
export const recreateAllScopes = async (user: SafeUser) => {
  const memberships = await db.membership.findMany({
    where: {
      userId: user.id,
    },
  })

  const teams = await db.team.findMany({
    where: {
      id: {
        in: memberships.map((membership) => membership.teamId),
      },
    },
  })

  const scopes = (await Promise.all(
    memberships.map((membership) => {
      const team = teams.find((team) => team.id === membership.teamId)
      if (!team) {
        return null
      }
      return createTeamScope(team, membership, user)
    })
  ).then((scopes) => scopes.filter((scope) => scope !== null))) as Scope[]

  await Promise.all(scopes.map(setScopeRedis))
}

const setScopeRedis = async (scope: Scope) => {
  await coreCacheReadRedis.set(`scope__id:${scope.id}`, JSON.stringify(scope))
  await coreCacheReadRedis.publish(
    `scope__id:${scope.id}`,
    JSON.stringify(scope)
  )
  await coreCacheReadRedis.hSet(
    `scope__userId:${scope.userId}`,
    scope.id,
    JSON.stringify(scope)
  )
  await coreCacheReadRedis.publish(
    `scope__userId:${scope.userId}`,
    JSON.stringify(scope)
  )
}
