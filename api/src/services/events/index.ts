import { createClient } from 'redis'

import { checkValue } from 'src/settings'

const eventsServerConfig = {
  userName: <string>checkValue('events.redis.userName'),
  password: <string>checkValue('events.redis.password'),
  host: <string>checkValue('events.redis.host'),
  port: <number>checkValue('events.redis.port'),
}

export const eventsRedisClient = createClient({
  url: `redis://${eventsServerConfig.userName}:${eventsServerConfig.password}@${eventsServerConfig.host}:${eventsServerConfig.port}`,
})

export type SyncEvent = {
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  ownerId: string
  ownerTypename: string
  objectId: string
  objectTypename: string
}
