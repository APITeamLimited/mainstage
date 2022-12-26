import { APITeamModel } from '@apiteam/types'
import { Prisma, Team } from '@prisma/client'

export const TeamModel: APITeamModel<
  Prisma.TeamCreateInput,
  Prisma.TeamUpdateInput,
  Team
> = {
  create: async (input) => {},
  update: async (id, input) => {},
  delete: async (id) => {},
  get: async (id) => {},
  getAll: async () => {},
  rebuildCache: async () => {},
}
