import * as Yup from 'yup'

import { db } from '../../../lib/db'
import { UserModel } from '../../../models/user'
import { checkAPITeamAdmin } from '../../../services/guards'
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
  await checkAPITeamAdmin()

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
  await checkAPITeamAdmin()

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
  await checkAPITeamAdmin()

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
  await checkAPITeamAdmin()

  throw new Error('Not implemented')
}

export const adminUserCreate = async (
  _: CreateInput<AdminUserCreateInputData>
) => {
  await checkAPITeamAdmin()

  throw new Error('Not implemented')
}

export const adminUserUpdate = async ({
  id,
  data,
}: UpdateInput<AdminUserUpdateInputData>) => {
  await checkAPITeamAdmin()

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

  const updatedUser = await UserModel.update(id, data)

  return {
    data: updatedUser,
  }
}

export const adminUserUpdateMany = async (
  _: UpdateInput<AdminUserUpdateInputData>
) => {
  await checkAPITeamAdmin()

  throw new Error('Not implemented')
}

export const adminUserDelete = async ({ id }: DeleteInput) => {
  await checkAPITeamAdmin()

  return {
    data: await UserModel.delete(id),
  }
}

export const adminUserDeleteMany = async (_: DeleteManyInput) => {
  await checkAPITeamAdmin()

  throw new Error('Not implemented')
}
