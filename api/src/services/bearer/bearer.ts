import { generateKeyPair, privateDecrypt } from 'crypto'

import JWT from 'jsonwebtoken'
import keypair from 'keypair'

import { validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

import { checkValue } from '../../config'

const issuer = checkValue<string>('entityAuth.jwt.issuer')
const audience = checkValue<string>('entityAuth.jwt.audience')
const expriesInMinutes = checkValue<number>('entityAuth.jwt.expriesInMinutes')
const privateKeyPassphrase = checkValue<string>(
  'entityAuth.jwt.privateKeyPassphrase'
)

let keyPair: {
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
