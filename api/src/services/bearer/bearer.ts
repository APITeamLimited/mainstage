import JWT from 'jsonwebtoken'
import keypair from 'keypair'
import { Scalars } from 'types/graphql'

import { validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

import { checkValue } from '../../config'

const issuer = checkValue<string>('api.bearer.issuer')
const audience = checkValue<string>('api.bearer.audience')
const expriesInMinutes = checkValue<number>('api.bearer.expiryMinutes')

export let keyPair: {
  publicKey: string
  privateKey: string
} | null = null

export const getKeyPair = async (): Promise<{
  publicKey: string
  privateKey: string
}> => {
  if (keyPair) {
    return keyPair
  }

  // Filter by created in case second pair accidentally gets created
  const existingKeyPair = await db.entityAuthKeyPair.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (!existingKeyPair) {
    // Create a new pem key pair
    const pair = keypair()

    // Save the key pair to the database
    await db.entityAuthKeyPair.create({
      data: {
        publicKey: pair.public,
        privateKey: pair.private,
      },
    })

    keyPair = {
      publicKey: pair.public,
      privateKey: pair.private,
    }
  } else {
    keyPair = {
      publicKey: existingKeyPair.publicKey,
      privateKey: existingKeyPair.privateKey,
    }
  }
  return keyPair
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
}: {
  clientID: Scalars['ID']
}) => {
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = context.currentUser.id

  const { privateKey } = await getKeyPair()

  // TODO: include a users role within a team in the payload

  const signed = JWT.sign(
    {
      userId,
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
