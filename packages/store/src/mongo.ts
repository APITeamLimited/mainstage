import { MongoClient } from 'mongodb'

import { checkValue } from './config'

const mongoHost = checkValue<string>('store.mongo.host')
const mongoPort = checkValue<number>('store.mongo.port')
const mongoUsername = checkValue<string>('store.mongo.userName')
const mongoPassword = checkValue<string>('store.mongo.password')
const mongoDatabase = checkValue<string>('store.mongo.database')

const mongoUrl = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}`

const mongoClient = new MongoClient(mongoUrl)

mongoClient.connect()

export const mongoDB = mongoClient.db(mongoDatabase)
