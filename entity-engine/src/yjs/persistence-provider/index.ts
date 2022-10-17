import { checkValue } from '../../config'

import { MongodbPersistence } from './y-mongodb/y-mongodb'
import { RedisPersistence } from './y-redis'

const mongoHost = checkValue<string>('entity-engine.mongo.host')
const mongoPort = checkValue<number>('entity-engine.mongo.port')
const mongoUsername = checkValue<string>('entity-engine.mongo.userName')
const mongoPassword = checkValue<string>('entity-engine.mongo.password')
const mongoCollection = checkValue<string>('entity-engine.mongo.collection')

const mongoUrl = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/`

export const mongoPersistence = new MongodbPersistence(
  mongoUrl,
  mongoCollection
)

//export const redisPersistence = new RedisPersistence({
//  redisOpts: {
//    port: eeRedisPort,
//    host: eeRedisHost,
//    username: eeRedisUsername,
//    password: eeRedisPassword,
//  },
//})
