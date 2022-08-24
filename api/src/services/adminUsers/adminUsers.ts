import { validateWith } from '@redwoodjs/api'

import { db } from 'src/lib/db'

import { checkAdmin } from '../checkAdmin'

export const adminUsers = async (page: number, perPage: number) => {
  //validateWith(checkAdmin)

  return await db.user.findMany({
    skip: perPage * (page - 1),
    take: perPage,
  })
}

export const adminUser = async (id: string) => {
  //validateWith(checkAdmin)

  return await db.user.findUnique({
    where: { id },
  })
}
