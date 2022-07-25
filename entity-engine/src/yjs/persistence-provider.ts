import Redis, { Cluster } from 'ioredis'
import * as error from 'lib0/error'
import * as logging from 'lib0/logging'
import * as mutex from 'lib0/mutex'
import { Observable } from 'lib0/observable'
import * as promise from 'lib0/promise'
import * as Y from 'yjs'

const logger = logging.createModuleLogger('y-redis')

/**
 * Handles persistence of a sinle doc.
 */
export class PersistenceDoc {
  rp: RedisPersistence
  name: string
  doc: Y.Doc
  mux: mutex.mutex
  _clock: number
  _fetchingClock: number
  //synced: PersistenceDoc | undefined

  updateHandler: (update: Uint8Array) => void

  constructor(rp: RedisPersistence, name: string, doc: Y.Doc) {
    this.rp = rp
    this.name = name
    this.doc = doc
    this.mux = mutex.createMutex()
    console.log('creating persistence doc', name)

    // Next expected index / len of the list of update
    this._clock = 0
    this._fetchingClock = 0

    // Update a doc in redis
    this.updateHandler = async (update: Uint8Array) => {
      // mux: only store update in redis if this document update does not originate from redis
      this.mux(() => {
        // Changed from rpushBuffer to rpush
        rp.redis?.rpush(name + ':updates', Buffer.from(update)).then((len) => {
          if (len === this._clock + 1) {
            this._clock++
            if (this._fetchingClock < this._clock) {
              this._fetchingClock = this._clock
            }
          }
          if (!rp.redis) {
            throw 'Redis not available'
          }
          rp.redis.publish(this.name, len.toString())
        })
      })
    }

    if (doc.store.clients.size > 0) {
      this.updateHandler(Y.encodeStateAsUpdate(doc))
    }
    doc.on('update', this.updateHandler)

    // @ts-ignore
    this.synced = rp.sub?.subscribe(name).then(() => this.getUpdates())
  }

  destroy(): Promise<unknown> {
    console.log('destroy persistence doc', this.name)
    this.doc.off('update', this.updateHandler)
    this.rp.docs.delete(this.name)
    return this.rp.sub?.unsubscribe(this.name) || Promise.resolve(0)
  }

  /**
   * Get all new updates from redis and increase clock if necessary.
   */
  async getUpdates(): Promise<PersistenceDoc> {
    console.log('getUpdates', this.name)
    const startClock = this._clock

    if (!this.rp.redis) {
      throw `Redis not available`
    }

    const updates = await this.rp.redis.lrangeBuffer(
      this.name + ':updates',
      startClock,
      -1
    )

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
        updates.forEach((update) => {
          Y.applyUpdate(this.doc, update)
        })
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

const createRedisInstance = (
  redisOpts: object | null,
  redisClusterOpts: Array<object> | null
): Redis | Cluster =>
  redisClusterOpts
    ? new Cluster(redisClusterOpts)
    : redisOpts
    ? new Redis(redisOpts)
    : new Redis()

export class RedisPersistence extends Observable<string> {
  docs: Map<string, PersistenceDoc>
  sub: Redis | Cluster | null
  redis: Redis | Cluster | null

  constructor({
    redisOpts = null,
    redisClusterOpts = null,
  }: {
    redisOpts?: object | null
    redisClusterOpts?: Array<object> | null
  }) {
    super()

    this.redis = createRedisInstance(redisOpts, redisClusterOpts)

    this.sub = createRedisInstance(redisOpts, redisClusterOpts)
    this.docs = new Map()

    console.log('creating redis instance', this.docs)

    this.sub.on('message', (channel, sclock) => {
      console.log('subscriber got message', channel, sclock)
      // console.log('message', channel, sclock)
      const pdoc = this.docs.get(channel)
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
        this.sub?.unsubscribe(channel)
      }
    })
  }

  bindState(name: string, ydoc: Y.Doc): PersistenceDoc {
    console.log('bind state docs ', this.docs)

    if (this.docs.has(name)) {
      throw error.create(
        `"${name}" is already bound to this RedisPersistence instance`
      )
    }
    const pd = new PersistenceDoc(this, name, ydoc)
    this.docs.set(name, pd)
    return pd
  }

  async writeState(name: string, state: Y.Doc) {
    console.log('write state', name)

    const pdoc = this.docs.get(name)
    if (!pdoc) {
      throw error.create(
        `"${name}" is not bound to this RedisPersistence instance`
      )
    }

    // Call the pdoc update handler to store the state in redis
    pdoc.updateHandler(Y.encodeStateAsUpdate(state))
  }

  async destroy() {
    console.log('destroy()')
    const docs = this.docs
    this.docs = new Map()
    await promise.all(Array.from(docs.values()).map((doc) => doc.destroy()))
    this.redis?.quit()
    this.sub?.quit()
    this.redis = null
    this.sub = null
  }

  closeDoc(name: string) {
    console.log('close doc', name)
    const doc = this.docs.get(name)
    if (doc) {
      return doc.destroy()
    }
  }

  clearDocument(name: string): Promise<number> {
    console.log('clear document', name)
    const doc = this.docs.get(name)
    if (doc) {
      doc.destroy()
    }

    if (!this.redis) {
      throw error.create('No redis instance available')
    }

    return this.redis.del(name + ':updates')
  }

  /**
   * Destroys this instance and removes all known documents from the database.
   * After that this Persistence instance is destroyed.
   */
  async clearAllDocuments(): Promise<void> {
    console.log('clear all documents')
    await promise.all(
      Array.from(this.docs.keys()).map(
        (name) => this.redis?.del(name + ':updates') || Promise.resolve(0)
      )
    )
    this.destroy()
  }
}
