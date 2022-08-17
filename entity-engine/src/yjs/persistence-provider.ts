import * as error from 'lib0/error'
import * as logging from 'lib0/logging'
import * as mutex from 'lib0/mutex'
import { Observable } from 'lib0/observable'
import * as promise from 'lib0/promise'
import { createClient, RedisClientOptions } from 'redis'
import * as Y from 'yjs'

import { checkValue } from '../config'
import { eeReadRedis, eeSubscribeRedis } from '../redis'

const logger = logging.createModuleLogger('y-readRedis')

/**
 * Handles persistence of a sinle doc.
 */
export class PersistenceDoc {
  rp: RedisPersistence
  id: string
  doc: Y.Doc
  mux: mutex.mutex
  _clock: number
  _fetchingClock: number
  synced: PersistenceDoc | undefined

  updateHandler: (update: Uint8Array) => void

  constructor(rp: RedisPersistence, id: string, doc: Y.Doc) {
    this.rp = rp
    this.id = id
    this.doc = doc
    this.mux = mutex.createMutex()
    console.log('creating persistence doc', id)

    // Next expected index / len of the list of update
    this._clock = 0
    this._fetchingClock = 0

    // Update a doc in readRedis
    this.updateHandler = async (update: Uint8Array) => {
      console.log('updateHandler RedisPersistence', this.id)
      // mux: only store update in readRedis if this document update does not originate from readRedis
      this.mux(() => {
        // Changed from rpushBuffer to rpush
        rp.readRedis
          ?.rPush(id + ':updates', Buffer.from(update).toString('base64'))
          .then((len) => {
            if (len === this._clock + 1) {
              this._clock++
              if (this._fetchingClock < this._clock) {
                this._fetchingClock = this._clock
              }
            }
            if (!rp.readRedis) {
              throw 'Redis not available'
            }
            rp.readRedis.publish(this.id, len.toString())
          })
      })
    }

    if (doc.store.clients.size > 0) {
      this.updateHandler(Y.encodeStateAsUpdate(doc))
    }
    doc.on('update', this.updateHandler)

    rp.subRedis?.subscribe(id, () => this.getUpdates())
  }

  async destroy(): Promise<unknown> {
    console.log('destroy persistence doc', this.id)
    this.doc.off('update', this.updateHandler)
    this.rp.persistenceDocs.delete(this.id)
    return this.rp.subRedis?.unsubscribe(this.id) || Promise.resolve(0)
  }

  /**
   * Get all new updates from readRedis and increase clock if necessary.
   */
  async getUpdates(): Promise<PersistenceDoc> {
    const startClock = this._clock

    if (!this.rp.readRedis) {
      throw `Redis not available`
    }

    //const updates = await this.rp.readRedis.lrangeBuffer(
    //  this.id + ':updates',
    //  startClock,
    //  -1
    //)

    // Load updates from redis using buffers
    const updates = await this.rp.readRedis.lRange(
      this.id + ':updates',
      startClock,
      -1
    ) //.map((update) => Buffer.from(update))

    logger(
      'Fetched ',
      logging.BOLD,
      logging.PURPLE,
      updates.length.toString().padEnd(2),
      logging.UNBOLD,
      logging.UNCOLOR,
      ' updates'
    )

    this.mux(() => {
      this.doc.transact(() => {
        try {
          updates.forEach((update) => {
            Y.applyUpdate(this.doc, Buffer.from(update, 'base64'))
          })
        } catch (e) {
          console.log('error getUpdates', e)
        }
        const nextClock = startClock + updates.length
        if (this._clock < nextClock) {
          this._clock = nextClock
        }
        if (this._fetchingClock < this._clock) {
          this._fetchingClock = this._clock
        }
      })
    })

    if (this._fetchingClock <= this._clock) {
      return this
    } else {
      // there is still something missing. new updates came in. fetch again.
      if (updates.length === 0) {
        // Calling getUpdates recursively has the potential to be an infinite fetch-call.
        // In case no new updates came in, reset _fetching clock (in case the pubsub lied / send an invalid message).
        // Being overly protective here..
        this._fetchingClock = this._clock
      }
      return this.getUpdates()
    }
  }
}

export class RedisPersistence extends Observable<string> {
  persistenceDocs: Map<string, PersistenceDoc>
  subRedis: ReturnType<typeof createClient> | null
  readRedis: ReturnType<typeof createClient> | null

  constructor() {
    super()

    this.readRedis = eeReadRedis
    this.subRedis = eeSubscribeRedis
    this.persistenceDocs = new Map()

    this.subRedis.on('message', (channel, sclock) => {
      console.log('subscriber got message', channel, sclock)
      const pdoc = this.persistenceDocs.get(channel)
      if (pdoc) {
        const clock = Number(sclock) || Number.POSITIVE_INFINITY // case of null
        if (pdoc._fetchingClock < clock) {
          // do not query doc updates if this document is currently already fetching
          const isCurrentlyFetching = pdoc._fetchingClock !== pdoc._clock
          if (pdoc._fetchingClock < clock) {
            pdoc._fetchingClock = clock
          }
          if (!isCurrentlyFetching) {
            pdoc.getUpdates()
          }
        }
      } else {
        // We no longer are tracking this document that was subscribed, so unsubscribe.
        this.subRedis?.unsubscribe(channel)
      }
    })
  }

  bindState(id: string, ydoc: Y.Doc): PersistenceDoc {
    const gotDoc = this.persistenceDocs.get(id)
    if (gotDoc) {
      return gotDoc
    }
    const pd = new PersistenceDoc(this, id, ydoc)
    this.persistenceDocs.set(id, pd)
    return pd
  }

  async writeState(id: string, state: Y.Doc) {
    const pdoc = this.persistenceDocs.get(id)
    if (!pdoc) {
      throw error.create(
        `"${id}" is not bound to this RedisPersistence instance`
      )
    }

    // Call the pdoc update handler to store the state in readRedis
    pdoc.updateHandler(Y.encodeStateAsUpdate(state))
  }

  async destroy() {
    console.log('destroy()')
    const persistenceDocs = this.persistenceDocs
    this.persistenceDocs = new Map()
    await promise.all(
      Array.from(persistenceDocs.values()).map((doc) => doc.destroy())
    )
    this.readRedis?.quit()
    this.subRedis?.quit()
    this.readRedis = null
    this.subRedis = null
  }

  closeDoc(id: string) {
    console.log('close doc', id)
    const doc = this.persistenceDocs.get(id)
    if (doc) {
      return doc.destroy()
    }
  }

  deleteDocument(id: string): Promise<number> {
    console.log('clear document', id)
    const doc = this.persistenceDocs.get(id)
    if (doc) {
      doc.destroy()
    }

    if (!this.readRedis) {
      throw error.create('No readRedis instance available')
    }

    return this.readRedis.del(id + ':updates')
  }

  /**
   * Destroys this instance and removes all known documents from the database.
   * After that this Persistence instance is destroyed.
   */
  //async clearAllDocuments(): Promise<void> {
  //  console.log('clear all documents')
  //  await promise.all(
  //    Array.from(this.persistenceDocs.keys()).map(
  //      (id) => this.readRedis?.del(id + ':updates') || Promise.resolve(0)
  //    )
  //  )
  //  this.destroy()
  //}
}
