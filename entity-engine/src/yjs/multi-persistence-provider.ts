import { Readable } from 'stream'

import Redis, { Cluster } from 'ioredis'
import * as logging from 'lib0/logging'
import * as mutex from 'lib0/mutex'
import { Observable } from 'lib0/observable'
import * as promise from 'lib0/promise'
import { Db, GridFSBucket } from 'mongodb'
import * as Y from 'yjs'

const logger = logging.createModuleLogger('y-redis')

/**
 * Handles persistence of a sinle doc.
 */
export class PersistenceDoc {
  mpp: MultiPersitenceProvider
  name: string
  doc: Y.Doc
  mux: mutex.mutex
  _clock: number
  _fetchingClock: number
  updateHandler: (update: Uint8Array) => void
  synced: any

  constructor(mpp: MultiPersitenceProvider, name: string, doc: Y.Doc) {
    this.mpp = mpp
    this.name = name
    this.doc = doc
    this.mux = mutex.createMutex()
    /**
     * Next expected index / len of the list of updates
     * @type {number}
     */
    this._clock = 0
    this._fetchingClock = 0

    this.updateHandler = (update: Uint8Array) => {
      // mux: only store update in redis if this document update does not originate from redis
      this.mux(() => {
        console.log('this.mpp.redisDB', this.mpp.mongoDb, doc.guid)
        const bucket = new GridFSBucket(this.mpp.mongoDb, {
          bucketName: doc.guid,
        })

        const buffer = Buffer.from(update)
        const bufferStream = Readable.from(buffer)
        const uploadStream = bucket.openUploadStream(`${doc.guid}:updates`)

        bufferStream.pipe(
          bucket.openUploadStream(`${doc.guid}:updates`, {
            contentType: 'uint8array',
          })
        )

        bufferStream.on('end', () => {
          uploadStream.end()
          const len = update.length
          mpp.redis.publish(this.name, len.toString())
        })
      })
    }
    if (doc.store.clients.size > 0) {
      this.updateHandler(Y.encodeStateAsUpdate(doc))
    }
    doc.on('update', this.updateHandler)
    this.synced = mpp.sub.subscribe(name).then(() => this.getUpdates())
  }

  destroy() {
    this.doc.off('update', this.updateHandler)
    this.mpp.docs.delete(this.name)
    return this.mpp.sub.unsubscribe(this.name)
  }

  /*
  Get all new updates from redis and increase clock if necessary.
  */
  getUpdates(): Promise<PersistenceDoc> {
    const bucket = new GridFSBucket(this.mpp.mongoDb, {
      bucketName: this.doc.guid,
    })

    const startClock = this._clock

    const stream = bucket.openDownloadStreamByName(`${this.doc.guid}:updates`)

    // Pipe stream to object
    const chunks: any[] | Uint8Array[] = []
    stream.on('data', (chunk) => {
      chunks.push(chunk)
    })

    // Convert chunks to Buffer[]
    stream.on('end', () => {
      const updates = new Uint8Array(Buffer.concat(chunks), 1, 2)

      console.log('updates', chunks, updates)

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
    })

    return Promise.resolve(this)
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

export class MultiPersitenceProvider extends Observable<string> {
  redis: Redis | Cluster
  sub: Redis | Cluster
  mongoDb: Db
  docs: Map<string, PersistenceDoc>
  bindCount: Map<string, number>
  constructor({
    redisOpts = null,
    redisClusterOpts = null,
    mongoDb,
  }: {
    redisOpts: object | null
    redisClusterOpts?: Array<object> | null
    mongoDb: Db
  }) {
    super()
    this.redis = createRedisInstance(redisOpts, redisClusterOpts)
    this.sub = createRedisInstance(redisOpts, redisClusterOpts)
    this.mongoDb = mongoDb
    console.log('mongoDb', mongoDb)

    this.docs = new Map()

    this.bindCount = new Map()
    this.sub.on('message', (channel: string, sclock) => {
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
        this.sub.unsubscribe(channel)
      }
    })
  }

  bindState(name: string, ydoc: Y.Doc): PersistenceDoc {
    if (this.docs.has(name)) {
      const bindCount = this.bindCount.get(name) || 0
      this.bindCount.set(name, bindCount + 1)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.docs.get(name)
    } else {
      const pd = new PersistenceDoc(this, name, ydoc)
      this.docs.set(name, pd)
      this.bindCount.set(name, (this.bindCount.get(name) || 0) + 1)
      return pd
    }
  }

  async destroy() {
    const docs = this.docs
    this.docs = new Map()
    this.bindCount = new Map()
    await promise.all(Array.from(docs.values()).map((doc) => doc.destroy()))
    this.redis.quit()
    this.sub.quit()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.redis = null
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.sub = null
  }

  closeDoc(name: string) {
    const doc = this.docs.get(name)

    const bindCount = this.bindCount.get(name) || 0
    const newBindCount = bindCount - 1

    if (doc && newBindCount <= 0) {
      this.bindCount.delete(name)
      return doc.destroy()
    } else {
      this.bindCount.set(name, newBindCount)
    }
  }

  clearDocument(name: string) {
    const doc = this.docs.get(name)
    if (doc) {
      this.bindCount.delete(name)
      doc.destroy()
    }
    return this.redis.del(name + ':updates')
  }
}

const getMongoUpdates = async (db Db, docName: string, opts = {}) =>
  getMongoBulkData(
    db,
    {
      ...createDocumentUpdateKey(docName, 0),
      clock: {
        $gte: 0,
        $lt: binary.BITS32,
      },
    },
    opts
  )
