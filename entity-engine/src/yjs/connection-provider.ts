import http from 'http'

import decoding from 'lib0/decoding.js'
import encoding from 'lib0/encoding.js'
import map from 'lib0/map.js'
import mutex from 'lib0/mutex.js'
import queryString from 'query-string'
import WebSocket from 'ws'
import awarenessProtocol from 'y-protocols/awareness.js'
import syncProtocol from 'y-protocols/sync.js'
import Y from 'yjs'

import { findScope } from '../services'
import { verifyJWT } from '../services'

import { RedisPersistence } from './persistence-provider'

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// Garbage collection for websocket connections, we want this for now, but may
// be useful later for restoration points
const gcEnabled = true

let persistence: {
  bindState: (arg0: string, arg1: WSSharedDoc) => void
  writeState: (arg0: string, arg1: WSSharedDoc) => Promise<void>
  provider: RedisPersistence
} | null = null

const redisPersistence = new RedisPersistence({})

persistence = {
  provider: redisPersistence,
  bindState: redisPersistence.bindState,
  writeState: redisPersistence.writeState,
}

export const setPersistence = (
  persistence_: {
    bindState: (arg0: string, arg1: WSSharedDoc) => void
    writeState: (arg0: string, arg1: WSSharedDoc) => Promise<void>
    provider: RedisPersistence
  } | null
) => {
  persistence = persistence_
}

export const getPersistence = (): null | {
  bindState: (arg0: string, arg1: WSSharedDoc) => void
  writeState: (arg0: string, arg1: WSSharedDoc) => Promise<void>
} => persistence

// Docs currently stored in memory
export const docs: Map<string, WSSharedDoc> = new Map()

const messageSync = 0
const messageAwareness = 1
// const messageAuth = 2

const updateHandler = (update: Uint8Array, doc: WSSharedDoc) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)

  persistence
    ?.writeState(doc.name, doc)
    .then(() => {
      doc.conns.forEach((_, conn) => send(doc, conn, message))
    })
    .catch((err) => {
      console.error(err)
    })
}

class WSSharedDoc extends Y.Doc {
  name: string
  mux: mutex.mutex
  conns: Map<WebSocket.WebSocket, Set<number>>
  awareness: awarenessProtocol.Awareness

  constructor(name: string) {
    super({ gc: gcEnabled })
    this.name = name
    this.mux = mutex.createMutex()
    this.conns = new Map()
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)

    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = (
      {
        added,
        updated,
        removed,
      }: {
        added: Array<number>
        updated: Array<number>
        removed: Array<number>
      },
      conn: WebSocket.WebSocket | null
    ) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = this.conns.get(conn)
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
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      )
      const buff = encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        send(this, c, buff)
      })
    }
    this.awareness.on('update', awarenessChangeHandler)
    this.on('update', updateHandler)
  }
}

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 */
export const getYDoc = (docname: string, gc = true): WSSharedDoc =>
  map.setIfUndefined(docs, docname, () => {
    const doc = new WSSharedDoc(docname)
    doc.gc = gc
    if (persistence !== null) {
      persistence.bindState(docname, doc)
    }
    docs.set(docname, doc)
    return doc
  })

const messageListener = (
  conn: WebSocket.WebSocket,
  doc: WSSharedDoc,
  message: Uint8Array
) => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)

    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, doc, null)
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn
        )
        break
      }
    }
  } catch (err) {
    console.error(err)
    doc.emit('error', [err])
  }
}

// Removes a conncetion from a doc
const closeConn = (doc: WSSharedDoc, conn: WebSocket.WebSocket) => {
  if (doc.conns.has(conn)) {
    const controlledIds: Set<number> = doc.conns.get(conn) || new Set()
    doc.conns.delete(conn)

    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    )
    if (doc.conns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }
  conn.close()
}

const send = (doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, (err) => {
      err != null && closeConn(doc, conn)
    })
  } catch (e) {
    closeConn(doc, conn)
  }
}

const pingTimeout = 30000

export const setupWSConnection = async (
  conn: WebSocket.WebSocket,
  request: http.IncomingMessage
) => {
  const params = queryString.parse(request.url || '')

  const scopeId = params.scopeId?.toString() || undefined

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

  // Check the scope service
  // TODO: check the scope service

  const gc = gcEnabled

  conn.binaryType = 'arraybuffer'

  // get doc, initialize if it does not exist yet
  const doc = getYDoc(scope.id, gc)
  doc.conns.set(conn, new Set())

  // listen and reply to events
  conn.on('message', (message) =>
    // Not sure if this should be casted as ArrayBuffer
    messageListener(conn, doc, new Uint8Array(message as ArrayBuffer))
  )

  // Check if connection is still alive
  let pongReceived = true

  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        closeConn(doc, conn)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)

  conn.on('close', () => {
    closeConn(doc, conn)
    clearInterval(pingInterval)
  })

  conn.on('pong', () => {
    pongReceived = true
  })

  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, conn, encoding.toUint8Array(encoder))
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
      send(doc, conn, encoding.toUint8Array(encoder))
    }
  }
}
