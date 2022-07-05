import { checkValue } from 'src/settings'

import { SyncEvent, eventsRedisClient as redis } from '.'

const deleteKeySeconds =
  <number>checkValue('events.deleteKeysAfterMinutes') * 60

/**
 * Serverside only service to publish events to redis.
 */
export const publishEvent = async (event: SyncEvent) => {
  // Add event to list in redis
  const groupSetKey = `${event.ownerTypename}_${event.ownerId}`

  // Create timestamped key for this list
  const currentMinute = Math.floor(Date.now() / 1000 / 60)
  const eventListKey = `${groupSetKey}_${currentMinute}`

  // Add timestamped key to set tracking group's keys, publish to the key setting the key's expiry
  redis
    .multi()
    .rPush(eventListKey, JSON.stringify(event))
    .expire(eventListKey, deleteKeySeconds, 'NX')
}
