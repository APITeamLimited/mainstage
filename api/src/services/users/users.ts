import type { Prisma } from '@prisma/client'

import { validate, validateWith } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

type User = Prisma.PromiseReturnType<typeof db.user.create>

export type PrivateUser = Omit<
  User,
  | 'updatedAt'
  | 'emailVerified'
  | 'hashedPassword'
  | 'salt'
  | 'resetToken'
  | 'resetTokenExpiresAt'
>

export const teamUsers = async ({ teamId }: { teamId: string }) => {
  // Ensure user is member of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const membership = await db.membership.findFirst({
    where: {
      teamId,
      userId,
    },
  })

  validateWith(() => {
    if (!membership) {
      throw 'You must be a member of this team to access this resource.'
    }
  })

  return (await db.user.findMany({
    where: {
      memberships: {
        some: {
          teamId,
        },
      },
    },
  })) as PrivateUser[]
}

export const teamUser = async ({
  id,
  teamId,
}: {
  id: string
  teamId: string
}) => {
  // Ensure user is member of the team
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const currentMembership = await db.membership.findFirst({
    where: {
      teamId,
      userId,
    },
  })

  validateWith(() => {
    if (!currentMembership) {
      throw 'You must be a member of this team to access this resource.'
    }
  })

  const user = await db.user.findFirst({
    where: {
      id,
      memberships: {
        some: {
          teamId,
        },
      },
    },
  })

  validateWith(() => {
    if (!user) {
      throw `User does not exist with id '${id}' in team '${teamId}'`
    }
  })

  // Shouldn't be needed, but better than ts-ignoring it
  if (!user) {
    throw `User does not exist with id '${id}' in team '${teamId}'`
  }

  return user as PrivateUser
}

export const currentUser = async () => {
  // Ensure logged in
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  // Shouldn't be needed, but better than ts-ignoring it
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const currentUser = await db.user.findUnique({
    where: {
      id: context.currentUser.id,
    },
  })

  if (!currentUser) {
    throw 'User profile does not exist.'
  }

  return currentUser as PrivateUser
}

export const updateCurrentUser = async (input: {
  firstName: string | undefined
  lastName: string | undefined
  email: string | undefined
  shortBio: string | undefined
}) => {
  validateWith(() => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  if (input.email) {
    validate(input.email, {
      email: { message: 'Please provide a valid email address' },
    })
  }

  // Shouldn't be needed, but better than ts-ignoring it
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser.id

  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      ...input,
    },
  })

  return user as PrivateUser
}
