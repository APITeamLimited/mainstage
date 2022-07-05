import { validate, validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { checkValue } from 'src/settings'

import { SyncEvent, eventsRedisClient as redis } from '.'

const deleteKeyMinutes = <number>checkValue('events.deleteKeysAfterMinutes')

export const getEvents = async ({
  input,
}: {
  input: {
    ownerTypename: string
    ownerId: string
  }
}) => {
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = context.currentUser.id

  validate(input.ownerTypename, 'ownerTypename', {
    presence: true,
    inclusion: {
      in: ['User', 'Team'],
      message: 'ownerTypename must be either "User" or "Team".',
    },
  })

  const ownerTypename = input.ownerTypename as 'User' | 'Team'

  validateWith(async () => {
    if (ownerTypename === 'Team') {
      const membership = await db.teamMembership.findFirst({
        where: {
          teamId: input.ownerId,
          userId,
        },
      })

      if (!membership) {
        throw 'You are not a member of this team or it does not exist.'
      }
    } else if (ownerTypename === 'User') {
      if (userId !== input.ownerId) {
        throw 'You are not this user'
      }
    } else {
      throw 'ownerTypename must be either "User" or "Team".'
    }
  })

  // Get sync events from redis
  const groupSetKey = `${ownerTypename}_${input.ownerId}`

  const currentMinute = Math.floor(Date.now() / 1000 / 60)

  const possibleKeys = Array.from(
    { length: deleteKeyMinutes },
    (_, i) => `${groupSetKey}_${currentMinute - i}`
  )

  // Get events at all possible keys
  const events = await redis.mGet(possibleKeys)

  // Parse events
  return events.map((event) => {
    if (event) {
      return JSON.parse(event)
    }
  }) as SyncEvent[]
}
