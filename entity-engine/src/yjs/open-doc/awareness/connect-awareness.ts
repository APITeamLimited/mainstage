import {
  ServerAwareness,
  RedisTeamPublishMessage,
  userAsTeam,
} from '@apiteam/types'
import type { Team, Membership } from '@prisma/client'

import { getReadRedis, getSubscribeRedis } from '../../../redis'
import { handleAddSubscription, globalActiveSubscriptions } from '../../../yjs'
import { OpenDoc } from '../open-doc'

import { createMemberAwareness, LastOnlineTime } from '.'

export const connectAwarenessHandler = async (openDoc: OpenDoc) => {
  const initialAwareness = await createServerAwareness({
    variant: openDoc.variant,
    variantTargetId: openDoc.variantTargetId,
  })

  if (openDoc.variant === 'TEAM') {
    openDoc.awareness.setLocalState(initialAwareness)

    // Subscribe to redis pubsub for team updates
    openDoc.activeSubscriptions.push(`team:${openDoc.variantTargetId}`)
    handleAddSubscription(`team:${openDoc.variantTargetId}`)

    // ??
    globalActiveSubscriptions.get(`team:${openDoc.variantTargetId}`)

    const subscribeRedis = await getSubscribeRedis()

    await subscribeRedis.subscribe(
      `team:${openDoc.variantTargetId}`,
      (message) => {
        const parsedMessage = JSON.parse(message) as RedisTeamPublishMessage

        if (parsedMessage.type === 'ADD_MEMBER') {
          openDoc.addMember(parsedMessage.payload)
          return
        } else if (parsedMessage.type === 'REMOVE_MEMBER') {
          openDoc.removeMember(parsedMessage.payload)
          return
        } else if (parsedMessage.type === 'CHANGE_ROLE') {
          openDoc.changeRoleMember(parsedMessage.payload)
          return
        } else if (parsedMessage.type === 'LAST_ONLINE_TIME') {
          // openDoc sometimes causes an error
          const serverAwareness = openDoc.awareness.getLocalState() as
            | ServerAwareness
            | undefined
          if (serverAwareness?.variant !== 'TEAM') return

          const newServerAwareness: ServerAwareness = {
            ...serverAwareness,
            members: serverAwareness.members.map((m) => {
              if (m.userId === parsedMessage.payload.userId) {
                return {
                  ...m,
                  lastOnline: parsedMessage.payload.lastOnline,
                }
              }
              return m
            }),
          }

          openDoc.awareness.setLocalState(newServerAwareness)
          return
        }
        console.warn(`Unknown message type for message ${message} ignoring...`)
      }
    )

    // Subscribe to user updates
    if (initialAwareness.variant !== 'TEAM') {
      throw new Error('Invalid variant')
    }

    const membershipSubscribePromises = initialAwareness.members.map(
      async (m) => {
        openDoc.activeSubscriptions.push(`user__id:${m.userId}`)
        handleAddSubscription(`user__id:${m.userId}`)

        return subscribeRedis.subscribe(`user__id:${m.userId}`, (message) =>
          openDoc.updateMemberUser(userAsTeam(JSON.parse(message)))
        )
      }
    )
    await Promise.all(membershipSubscribePromises)
  } else if (openDoc.variant === 'USER') {
    openDoc.awareness.setLocalState(initialAwareness)
  } else {
    throw new Error(`Unknown variant ${openDoc.variant}`)
  }
}

const createServerAwareness = async ({
  variant,
  variantTargetId,
}: {
  variant: string
  variantTargetId: string
}): Promise<ServerAwareness> => {
  if (variant === 'TEAM') {
    const readRedis = await getReadRedis()

    const allTeamInfoRaw = await readRedis.hGetAll(`team:${variantTargetId}`)

    const team = JSON.parse(allTeamInfoRaw.team) as Team
    const memberships = [] as Membership[]

    Object.entries(allTeamInfoRaw).map(([key, value]) => {
      if (key.startsWith('membership:')) {
        memberships.push(JSON.parse(value) as Membership)
      }
    })

    const usersRaw = (
      memberships.length > 0
        ? await readRedis.mGet(memberships.map((m) => `user__id:${m.userId}`))
        : []
    ).filter((userRaw) => userRaw !== null) as string[]

    const users = usersRaw.map((userRaw) => userAsTeam(JSON.parse(userRaw)))

    const lastOnlineTimes = [] as LastOnlineTime[]

    Object.entries(allTeamInfoRaw).map(([key, value]) => {
      if (key.startsWith('lastOnlineTime:')) {
        lastOnlineTimes.push({
          userId: key.split(':')[1],
          lastOnline: new Date(parseInt(value)),
        })
      }
    })

    const members = memberships.map((m) => {
      const user = users.find((u) => u.id === m.userId)
      if (!user) {
        throw new Error(
          `Could not find user ${m.userId} for membership ${m.id} cannot create server awareness`
        )
      }
      return createMemberAwareness(user, m, lastOnlineTimes)
    })

    return {
      variantTargetId,
      variant,
      team,
      members,
    }
  } else if (variant === 'USER') {
    return {
      variantTargetId,
      variant,
    }
  } else {
    throw new Error(`Unsupported variant ${variant}`)
  }
}
