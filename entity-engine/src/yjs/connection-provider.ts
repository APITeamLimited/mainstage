import { RedisTeamPublishMessage, ServerAwareness } from '@apiteam/types'
import { Scope } from '@prisma/client'
import * as encoding from 'lib0/encoding'
import * as map from 'lib0/map'
import { Socket } from 'socket.io'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import { getReadRedis, getSubscribeRedis } from '../redis'

import { OpenDoc } from './open-doc'
import { mongoPersistence } from './persistence-provider'
import * as syncProtocol from './sync'
import { handlePostAuth } from './utils'

export const messageSyncType = 0
export const messageAwarenessType = 1
export const messageSyncedType = 2

export const openDocs = new Map<string, OpenDoc>()

// Subscriptions can exist between open docs so don't close them if open in another doc
export const globalActiveSubscriptions = new Map<string, number>()

const updateCallback = (docName: string, update: Uint8Array) => {
  mongoPersistence.storeUpdate(docName, update)
}

const getNewDoc = async (docName: string, scope: Scope): Promise<OpenDoc> => {
  const doc = new OpenDoc(scope, updateCallback)
  const persistedYdoc = await mongoPersistence.getYDoc(docName)
  const newUpdates = Y.encodeStateAsUpdate(doc)
  mongoPersistence.storeUpdate(docName, newUpdates)
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(persistedYdoc))

  // TODO: use redis for short term updates and realtime sync between server clients
  //redisPersistence.bindState(docName, doc)

  openDocs.set(docName, doc)
  return doc
}

export const getOpenDoc = async (scope: Scope): Promise<OpenDoc> => {
  const docName = `${scope.variant}:${scope.variantTargetId}`
  const openDoc = openDocs.get(docName) ?? (await getNewDoc(docName, scope))

  if (openDoc.awareness.getLocalState() === null) {
    await openDoc.connectAwareness()
  }

  return openDoc
}

export const handleNewConnection = async (socket: Socket) => {
  const postAuth = await handlePostAuth(socket)

  if (postAuth === null) {
    console.error('Failed to carry out post-auth')
    socket.disconnect()
    return
  }

  const { scope } = postAuth

  const doc = await getOpenDoc(scope)

  doc.sockets.set(socket, new Set())
  doc.scopes.set(socket, new Set())
  const scopeSet = doc.scopes.get(socket)

  if (!scopeSet) {
    console.log('dc close 1')
    doc.closeSocket(socket)
    console.warn('Could not find scope set for socket')
    return
  }

  scopeSet.add(scope)

  const serverAwareness = doc.serverAwareness

  if (serverAwareness.variant === 'TEAM') {
    const member = serverAwareness.members.find(
      (member) => member.userId === scope.userId
    )

    if (!member) {
      console.log('dc close 2')
      doc.closeSocket(socket)
      console.warn('Could not find member for socket')
      return
    }

    member.lastOnline = new Date()

    const newServerAwareness: ServerAwareness = {
      ...serverAwareness,
      members: serverAwareness.members.map((member) => {
        if (member.userId === scope.userId) {
          return {
            ...member,
            lastOnline: new Date(),
          }
        }

        return member
      }),
    }

    doc.awareness.setLocalState(newServerAwareness)

    const readRedis = await getReadRedis()

    const setPromise = readRedis.hSet(
      `team:${doc.variantTargetId}`,
      `lastOnlineTime:${scope.userId}`,
      member.lastOnline.getTime()
    )

    const publishPromise = readRedis.publish(
      `team:${doc.variantTargetId}`,
      JSON.stringify({
        type: 'LAST_ONLINE_TIME',
        payload: {
          userId: scope.userId,
          lastOnline: member.lastOnline,
        },
      } as RedisTeamPublishMessage)
    )

    await Promise.all([setPromise, publishPromise])
  }

  socket.on('message', (message: ArrayBuffer) => {
    doc.messageListener(socket, new Uint8Array(message))
  })

  socket.on('forceDisconnect', () => {
    console.log('dc close 3')
    doc.closeSocket(socket)
  })

  // On disconnect remove the connection from the doc
  socket.on('disconnect', () => {
    console.log('dc close 4')
    doc.closeSocket(socket)
  })

  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSyncType)

    syncProtocol.writeSyncStep1(encoder, doc)
    doc.send(socket, encoding.toUint8Array(encoder))

    const awarenessStates = doc.awareness.getStates()

    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()

      encoding.writeVarUint(encoder, messageAwarenessType)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys())
        )
      )

      doc.send(socket, encoding.toUint8Array(encoder))
    }

    // Tell socket synced
    socket.emit('synced')
  }
}

export const handleAddSubscription = (name: string) => {
  const count = map.setIfUndefined(globalActiveSubscriptions, name, () => 0)
  globalActiveSubscriptions.set(name, count + 1)
}

export const handleRemoveSubscription = async (name: string) => {
  const count = globalActiveSubscriptions.get(name)

  if (!count) return

  if (count === 1) {
    globalActiveSubscriptions.delete(name)
    const subscribeRedis = await getSubscribeRedis()

    name.endsWith('*')
      ? await subscribeRedis.pUnsubscribe(name)
      : await subscribeRedis.unsubscribe(name)

    return
  }

  globalActiveSubscriptions.set(name, count - 1)
}

export { OpenDoc } from './open-doc'
