import * as Yup from 'yup'

import { ServiceValidationError } from '@redwoodjs/api'

import { deleteUser, recreateAllScopes, setUserRedis } from 'src/helpers'
import { db } from 'src/lib/db'

import { checkAdmin } from '../../checkAdmin'
import {
  CreateInput,
  DeleteInput,
  DeleteManyInput,
  GetListInput,
  GetManyInput,
  GetManyReferenceInput,
  GetOneInput,
  UpdateInput,
} from '../lib'

type AdminUserCreateInputData = {
  firstName: string
  lastName: string
  email: string
  isAdmin?: boolean
  emailVerified?: boolean
  shortBio?: string
  profilePicture?: string
}

type AdminUserUpdateInputData = Omit<AdminUserCreateInputData, 'isAdmin'>

export const adminUserGetList = async ({ pagination }: GetListInput) => {
  await checkAdmin()

  const { page, perPage } = pagination

  const dataPromise = db.user.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
  })

  const totalPromise = db.user.count()

  const [data, total] = await Promise.all([dataPromise, totalPromise])

  return {
    data,
    total,
  }
}

export const adminUserGetOne = async ({ id }: GetOneInput) => {
  await checkAdmin()

  const data = await db.user.findFirst({
    where: {
      id,
    },
  })

  return {
    data,
  }
}

export const adminUserGetMany = async ({ ids }: GetManyInput) => {
  await checkAdmin()

  const data = await db.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  return {
    data,
  }
}

export const adminUserGetManyReference = async (_: GetManyReferenceInput) => {
  await checkAdmin()

  throw new Error('Not implemented')
}

export const adminUserCreate = async (
  _: CreateInput<AdminUserCreateInputData>
) => {
  await checkAdmin()

  throw new Error('Not implemented')
}

export const adminUserUpdate = async ({
  id,
  data,
}: UpdateInput<AdminUserUpdateInputData>) => {
  await checkAdmin()

  if (data.shortBio) {
    const schema = Yup.string().max(140, 'Must be 140 characters or less')
    await schema.validate(data.shortBio)
  }

  if (data.firstName) {
    const schema = Yup.string().max(50, 'Must be 50 characters or less')
    await schema.validate(data.firstName)
  }

  if (data.lastName) {
    const schema = Yup.string().max(50, 'Must be 50 characters or less')
    await schema.validate(data.lastName)
  }

  if (data.email) {
    const schema = Yup.string().email('Must be a valid email')
    await schema.validate(data.email)
  }

  const updatedUser = await db.user.update({
    where: {
      id,
    },
    data,
  })

  await setUserRedis(updatedUser)
  await recreateAllScopes(updatedUser)

  return {
    data: updatedUser,
  }
}

export const adminUserUpdateMany = async (
  _: UpdateInput<AdminUserUpdateInputData>
) => {
  await checkAdmin()

  throw new Error('Not implemented')
}

export const adminUserDelete = async ({ id }: DeleteInput) => {
  await checkAdmin()

  const user = await db.user.findFirst({
    where: {
      id,
    },
  })

  if (!user) {
    throw new ServiceValidationError('User not found')
  }

  await deleteUser(user)

  return {
    data: user,
  }
}

export const adminUserDeleteMany = async (_: DeleteManyInput) => {
  await checkAdmin()

  throw new Error('Not implemented')
}
