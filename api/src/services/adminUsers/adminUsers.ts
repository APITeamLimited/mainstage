import * as Yup from 'yup'

import { recreateAllScopes, setUserRedis } from 'src/helpers'
import { db } from 'src/lib/db'

import { DATA_VALID_TIME } from '../admin/constants'
import { checkAdmin } from '../checkAdmin'

export const adminUserGetList = async ({
  page = 1,
  perPage = 100,
}: {
  page?: number
  perPage?: number
}) => {
  await checkAdmin()

  const dataPromise = db.user.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
  })

  const totalPromise = db.user.count()

  const [data, total] = await Promise.all([dataPromise, totalPromise])

  return {
    data,
    total,
    validUntil: new Date(Date.now() + DATA_VALID_TIME),
  }
}

export const adminUserGetOne = async ({ id }: { id: string }) => {
  await checkAdmin()

  const data = await db.user.findFirst({
    where: {
      id,
    },
  })

  return {
    data,
    validUntil: new Date(Date.now() + DATA_VALID_TIME),
  }
}

export const adminUsersReference = async (
  target: string,
  id: string,
  page: number,
  perPage: number
) => {
  await checkAdmin()

  throw new Error('Not implemented')
}

export const adminUserUpdate = async ({
  id,
  firstName,
  lastName,
  email,
  shortBio,
  emailVerified,
}: {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  shortBio?: string | null
  emailVerified?: boolean
}) => {
  await checkAdmin()

  if (shortBio) {
    const schema = Yup.string().max(140, 'Must be 140 characters or less')
    await schema.validate(shortBio)
  }

  if (firstName) {
    const schema = Yup.string().max(50, 'Must be 50 characters or less')
    await schema.validate(firstName)
  }

  if (lastName) {
    const schema = Yup.string().max(50, 'Must be 50 characters or less')
    await schema.validate(lastName)
  }

  if (email) {
    const schema = Yup.string().email('Must be a valid email')
    await schema.validate(email)
  }

  const updatedUser = await db.user.update({
    where: {
      id,
    },
    data: {
      firstName,
      lastName,
      email,
      shortBio,
      emailVerified,
    },
  })

  await setUserRedis(updatedUser)
  await recreateAllScopes(updatedUser)

  return {
    data: updatedUser,
    validUntil: new Date(Date.now() + DATA_VALID_TIME),
  }
}
