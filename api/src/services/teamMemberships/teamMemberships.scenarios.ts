import type { Prisma } from '@prisma/client'

export const standard = defineScenario<Prisma.TeamMembershipCreateArgs>({
  teamMembership: {
    one: {
      data: {
        role: 'String',
        user: {
          create: {
            firstName: 'String',
            lastName: 'String',
            email: 'String2712882',
            hashedPassword: 'String',
            salt: 'String',
          },
        },
        team: { create: { name: 'String' } },
      },
    },
    two: {
      data: {
        role: 'String',
        user: {
          create: {
            firstName: 'String',
            lastName: 'String',
            email: 'String3447178',
            hashedPassword: 'String',
            salt: 'String',
          },
        },
        team: { create: { name: 'String' } },
      },
    },
  },
})

export type StandardScenario = typeof standard
