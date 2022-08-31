import { ServiceValidationError } from '@redwoodjs/api'

import { db } from 'src/lib/db'

export const checkOwner = async ({ teamId }: { teamId: string }) => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  const currentUserMembership = await db.membership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: context.currentUser?.id },
    },
  })

  if (!currentUserMembership) {
    throw new ServiceValidationError(
      'You do not have permission to access this resource.'
    )
  }

  if (currentUserMembership.role !== 'OWNER') {
    throw new ServiceValidationError(
      'You need to be an owner to access this resource.'
    )
  }
}
