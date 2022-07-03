import type { Prisma } from '@prisma/client'

export const standard = defineScenario<Prisma.TeamInvitationCreateArgs>({
  teamInvitation: {
    one: {
      data: {
        email: 'String2722766',
        role: 'String',
        team: { create: { name: 'String' } },
      },
    },
    two: {
      data: {
        email: 'String2291709',
        role: 'String',
        team: { create: { name: 'String' } },
      },
    },
  },
})

export type StandardScenario = typeof standard
