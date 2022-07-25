import http from 'http'

import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import * as map from 'lib0/map'
import * as mutex from 'lib0/mutex'
import WebSocket from 'ws'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as syncProtocol from 'y-protocols/sync'
import * as Y from 'yjs'

import { findScope } from '../services'
import { verifyJWT } from '../services'

import { RedisPersistence } from './persistence-provider'

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

const pingTimeout = 100 //30000
//
//export const persistence = new RedisPersistence({
//  redisOpts: {},
//})
//
const persistence = null

// Docs currently stored in memory
export const docs: Map<string, WSSharedDoc> = new Map()

const messageSync = 0
const messageAwareness = 1
// const messageAuth = 2

class WSSharedDoc extends Y.Doc {
  name: string
  mux: mutex.mutex
  conns: Map<WebSocket.WebSocket, Set<number>>
  awareness: awarenessProtocol.Awareness

  constructor(name: string) {
    super({ gc: true })
    this.name = name
    this.mux = mutex.createMutex()
    this.conns = new Map()
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)

    this.awareness.on(
      'update',
      (
        {
          added,
          updated,
          removed,
        }: {
          added: Array<number>
          updated: Array<number>
          removed: Array<number>
        },
        connectionWithChange: WebSocket.WebSocket | null
      ) => {
        console.log('awareness update', added, updated, removed)
        const changedClients = added.concat(updated, removed)

        if (connectionWithChange !== null) {
          const connControlledIDs = this.conns.get(connectionWithChange)
          if (connControlledIDs !== undefined) {
            added.forEach((clientID) => {
              connControlledIDs.add(clientID)
            })
            removed.forEach((clientID) => {
              connControlledIDs.delete(clientID)
            })
          }
        }

        // broadcast awareness update
        const encoder = encoding.createEncoder()

        encoding.writeVarUint(encoder, messageAwareness)
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(
            this.awareness,
            changedClients
          )
        )

        const buff = encoding.toUint8Array(encoder)

        this.conns.forEach((_, c) => {
          this.send(c, buff)
        })
      }
    )

    this.on('update', async (update: Uint8Array, doc: WSSharedDoc) => {
      console.log('wsshareddoc update', update)

      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSync)

      syncProtocol.writeUpdate(encoder, update)
      const message = encoding.toUint8Array(encoder)

      //await persistence.writeState(doc.name, doc)
      doc.conns.forEach((_, conn) => this.send(conn, message))
    })
  }

  send(conn: WebSocket, m: Uint8Array) {
    console.log(
      'sending message',
      m,
      // @ts-ignore
      Object.keys(conn.server)
    )
    if (
      conn.readyState !== wsReadyStateConnecting &&
      conn.readyState !== wsReadyStateOpen
    ) {
      this.closeConn(conn)
    }
    try {
      conn.send(m, (err) => {
        err != null && this.closeConn(conn)
      })
    } catch (e) {
      console.log('failed to send message from wssahreddoc', e)
      this.closeConn(conn)
    }
  }

  // Removes a connection from a doc
  closeConn(conn: WebSocket.WebSocket) {
    console.log('wsshareddoc closing connection')

    if (this.conns.has(conn)) {
      const controlledIds: Set<number> = this.conns.get(conn) || new Set()
      this.conns.delete(conn)

      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        Array.from(controlledIds),
        null
      )
      if (this.conns.size === 0 && persistence !== null) {
        // if persisted, we store state and destroy ydocument
        //persistence.writeState(this.name, this).then(() => {
        //  this.destroy()
        //})
        docs.delete(this.name)
      }
    }

    // Check if already closed
    if (conn.readyState.toString() === 'closed') {
      console.log('already closed')
      return
    }
    conn.close?.()
  }

  messageListener(conn: WebSocket.WebSocket, message: Uint8Array) {
    try {
      const encoder = encoding.createEncoder()
      const decoder = decoding.createDecoder(message)
      const messageType = decoding.readVarUint(decoder)

      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync)
          syncProtocol.readSyncMessage(decoder, encoder, this, null)
          if (encoding.length(encoder) > 1) {
            this.send(conn, encoding.toUint8Array(encoder))
          }
          break
        case messageAwareness: {
          awarenessProtocol.applyAwarenessUpdate(
            this.awareness,
            decoding.readVarUint8Array(decoder),
            conn
          )
          break
        }
      }
    } catch (err) {
      console.error(err)
      this.emit('error', [err])
    }
  }
}

/**
 * Gets a Y.Doc and stores it in memory if not already stored
 */
export const getYDoc = (scopeId: string): WSSharedDoc => {
  return map.setIfUndefined(docs, scopeId, () => {
    console.log('Creating new doc', scopeId)
    const doc = new WSSharedDoc(scopeId)
    docs.set(scopeId, doc)
    return doc
  })
}

/**
 * Handles a new connection and adds it to the doc
 */
export const setupWSConnection = async (
  conn: WebSocket,
  request: http.IncomingMessage
) => {
  const scopeId = request.url?.split('?')[0].split('/')[1] || undefined

  if (!scopeId) {
    conn.close()
    return
  }

  // Already handled auth but get jwt again for user info
  const jwt = await verifyJWT(request)

  if (jwt == null) {
    conn.close()
    return
  }

  const scope = await findScope(scopeId)

  if (scope == null) {
    conn.close()
    return
  }

  conn.binaryType = 'arraybuffer'

  const doc = getYDoc(scope.id)
  doc.conns.set(conn, new Set())

  // listen and reply to events
  conn.on('message', (message) =>
    // Not sure if this should be casted as ArrayBuffer
    doc.messageListener(conn, new Uint8Array(message as ArrayBuffer))
  )

  // Check if connection is still alive
  let pongReceived = true

  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        doc.closeConn(conn)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        doc.closeConn(conn)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)

  conn.on('close', () => {
    doc.closeConn(conn)
    clearInterval(pingInterval)
  })

  console.log(
    'keys', // @ts-ignore
    Object.keys(conn)
  )

  //conn.send('Welcome to Y.Doc')

  conn.on('pong', () => {
    pongReceived = true
  })

  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    doc.send(conn, encoding.toUint8Array(encoder))
    const awarenessStates = doc.awareness.getStates()

    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys())
        )
      )
      doc.send(conn, encoding.toUint8Array(encoder))
    }
  }
}
