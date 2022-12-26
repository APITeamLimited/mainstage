import { APITeamModel } from '@apiteam/types'
import { Prisma, User } from '@prisma/client'

export const UserModel: APITeamModel<
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  User
> = {
  create: async (input) => {},
  update: async (id, input) => {},
  delete: async (id) => {},
  get: async (id) => {},
  getAll: async () => {},
  rebuildCache: async () => {},
}
