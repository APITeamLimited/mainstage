import { getDisplayName, UserAsPersonal } from '@apiteam/types'
import type { Membership, Team, PlanInfo, Scope } from '@prisma/client'

import { db } from 'src/lib/db'
import { getCoreCacheReadRedis } from 'src/lib/redis'

/*
Creates or updates an existing personal scope with latest user data.
*/
export const createPersonalScope = async (
  user: UserAsPersonal,
  planInfo: PlanInfo,
  forceUpdate = false
) => {
  const role = null
  const displayName = getDisplayName(user)
  const profilePicture = user.profilePicture
  const slug = user.slug

  const getLatestScope = async () => {
    const existingScope = await db.scope.findFirst({
      where: {
        variant: 'USER',
        variantTargetId: user.id,
      },
    })

    if (existingScope) {
      // If details different than existing scope, update existing scope
      if (
        existingScope.role !== role ||
        existingScope.displayName !== displayName ||
        existingScope.profilePicture !== profilePicture ||
        existingScope.slug !== slug ||
        existingScope.planName !== planInfo.name
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
            planName: planInfo.name,
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
        planName: planInfo.name,
      },
    })

    return {
      scope: newScope,
      changed: true,
    }
  }

  const { scope, changed } = await getLatestScope()

  if (changed || forceUpdate) {
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
  user: UserAsPersonal,
  planInfo: PlanInfo,
  forceUpdate = false
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
        existingScope.slug !== slug ||
        existingScope.planName !== planInfo.name
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
            planName: planInfo.name,
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
        planName: planInfo.name,
      },
    })

    return {
      scope: newScope,
      changed: true,
    }
  }

  const { scope, changed } = await getLatestScope()

  if (changed || forceUpdate) {
    await setScopeRedis(scope)
  }

  return scope
}

const setScopeRedis = async (scope: Scope) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

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
