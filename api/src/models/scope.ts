import { APITeamModel } from '@apiteam/types'
import { Prisma, Scope } from '@prisma/client'

export const ScopeModel: APITeamModel<
  Prisma.ScopeCreateInput,
  Prisma.ScopeUpdateInput,
  Scope
> = {
  create: async (input) => {},
  update: async (id, input) => {},
  delete: async (id) => {},
  get: async (id) => {},
  getAll: async () => {},
  rebuildCache: async () => {},
}
