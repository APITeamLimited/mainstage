import { ensureCorrectType } from '@apiteam/types'
import { Scope } from '@prisma/client'
import JWT from 'jsonwebtoken'
import keypair from 'keypair'

import { ServiceValidationError, validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'

import { checkValue } from '../../config'

const issuer = checkValue<string>('api.bearer.issuer')
const audience = checkValue<string>('api.bearer.audience')
const expriesInMinutes = checkValue<number>('api.bearer.expiryMinutes')

type KeyPair = {
  publicKey: string
  privateKey: string
}

export const getKeyPair = async (): Promise<KeyPair> => {
  // Filter by created in case second pair accidentally gets created
  const existingKeyPairCoreCache = ensureCorrectType(
    await coreCacheReadRedis.get(`authKeyPair`)
  )

  if (existingKeyPairCoreCache !== null) {
    return JSON.parse(existingKeyPairCoreCache) as KeyPair
  }

  const existingKeyPairDb = await db.entityAuthKeyPair.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (existingKeyPairDb) {
    const keyPairDb = {
      publicKey: existingKeyPairDb.publicKey,
      privateKey: existingKeyPairDb.privateKey,
    }

    await coreCacheReadRedis.set(`authKeyPair`, JSON.stringify(keyPairDb))

    return keyPairDb
  }

  // Create a new pem key pair
  const pair = keypair()

  // Save the key pair to the database
  await db.entityAuthKeyPair.create({
    data: {
      publicKey: pair.public,
      privateKey: pair.private,
    },
  })

  return {
    publicKey: pair.public,
    privateKey: pair.private,
  }
}

export const bearer = async () => {
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = context.currentUser.id

  const { privateKey } = await getKeyPair()

  const signed = JWT.sign(
    {
      userId,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience,
      expiresIn: expriesInMinutes * 60,
    }
  )

  return signed
}

/*
Public bearer is used by yjs clients to demonstrate that they are a certain user,
they are meant to be shared publicy amongst a team
*/
export const publicBearer = async ({
  clientID,
  scopeId,
}: {
  clientID: string
  scopeId: string
}) => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  const userId = context.currentUser.id

  const { privateKey } = await getKeyPair()

  // TODO: include a users role within a team in the payload
  const scopeRaw = ensureCorrectType(
    await coreCacheReadRedis.get(`scope__id:${scopeId}`)
  )

  if (!scopeRaw) {
    throw new ServiceValidationError('No scope found for the current user')
  }

  const scope = JSON.parse(scopeRaw) as Scope

  if (scope.userId !== userId) {
    throw new ServiceValidationError('No scope found for the current user')
  }

  const signed = JWT.sign(
    {
      userId,
      scopeId,
      clientID: parseInt(clientID),
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer,
      audience: `${audience}-public`,
      // Does not expire
      expiresIn: expriesInMinutes * 60 * 24 * 365.25,
    }
  )

  return signed
}

export const verify = async (token: string) => {
  const { publicKey } = await getKeyPair()

  const verified = JWT.verify(token, publicKey, {
    algorithms: ['RS256'],
    issuer,
    audience,
  })

  return verified
}
