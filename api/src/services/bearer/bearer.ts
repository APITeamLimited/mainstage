import JWT from 'jsonwebtoken'
import keypair from 'keypair'

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
