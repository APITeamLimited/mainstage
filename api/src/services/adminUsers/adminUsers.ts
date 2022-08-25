import { validateWith } from '@redwoodjs/api'

import { db } from 'src/lib/db'

import { checkAdmin } from '../checkAdmin'

type AdminUserArgs = {
  page?: number
  perPage?: number
}

export const adminUserGetList = async ({
  page = 1,
  perPage = 100,
}: AdminUserArgs
) => {
  validateWith(checkAdmin)

  console.log({ page, perPage })

  const dataPromise = db.user.findMany({
    skip: (page - 1) * perPage,
    take: perPage
  })

  const totalPromise = db.user.count()

  const [data, total] = await Promise.all([dataPromise, totalPromise])

  return {
    data,
    total,
    validUntil: new Date(Date.now() + 1000 * 60 * 20),
  }
}

export const adminUserGetOne = async (id: string) => {
  validateWith(checkAdmin)

  const data = await db.user.findFirst({
    where: {
      id,
    },
  })

  return {
    data,
    validUntil: new Date(Date.now() + 1000 * 60 * 20),
  }
}

export const adminUsersReference = async (
  target: string,
  id: string,
  page: number,
  perPage: number
) => {
  validateWith(checkAdmin)

  throw new Error('Not implemented')
}