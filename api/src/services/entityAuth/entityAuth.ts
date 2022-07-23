import { generateKeyPair } from 'crypto'

import JWT from 'jsonwebtoken'

import { validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

import { checkValue } from '../../config'

const issuer = checkValue<string>('entityAuth.jwt.issuer')
const audience = checkValue<string>('entityAuth.jwt.audience')
const expriesInMinutes = checkValue<number>('entityAuth.jwt.expriesInMinutes')

let keyPair: {
  publicKey: string
  privateKey: string
} | null = null

const getKeyPair = async (
  timeTried = 0
): Promise<{
  publicKey: string
  privateKey: string
}> => {
  if (keyPair) {
    return keyPair
  }

  if (timeTried > 3) {
    throw 'Could not generate key pair, tried 3 times'
  }

  // Filter by created in case second pair accidentally gets created
  const existingKeyPair = await db.entityAuthKeyPair.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (!existingKeyPair) {
    // Create a new pem key pair
    generateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: '',
        },
      },
      async (err, publicKey, privateKey) => {
        if (err) {
          throw err
        }

        // Save the key pair to the database
        await db.entityAuthKeyPair.create({
          data: {
            publicKey: publicKey,
            privateKey: privateKey,
          },
        })
      }
    )
  } else {
    keyPair = {
      publicKey: existingKeyPair.publicKey,
      privateKey: existingKeyPair.privateKey,
    }
    return keyPair
  }

  return getKeyPair(timeTried + 1)
}

export const generateBearer = async () => {
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = context.currentUser.id

  const { privateKey } = await getKeyPair()

  return JWT.sign(
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
}
