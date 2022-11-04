import type { SafeUser } from '@apiteam/types/src'
import type { User } from '@prisma/client'
import { url as gravatarUrl } from 'gravatar'

import { ServiceValidationError } from '@redwoodjs/api'

import { recreateAllScopes, setUserRedis } from 'src/helpers'
import { db } from 'src/lib/db'

export const updateCurrentUser = async ({
  firstName,
  lastName,
  shortBio,
  emailMarketing,
  slug,
}: {
  firstName?: string
  lastName?: string
  shortBio?: string | null
  emailMarketing?: boolean
  slug?: string
}): Promise<SafeUser> => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to update your profile.'
    )
  }

  // Validate shortBio max length of 140 characters
  if (shortBio && shortBio.length > 140) {
    throw new ServiceValidationError(
      'Your short bio must be less than 140 characters.'
    )
  }

  // Validate first and last name max length of 50 characters each
  if (firstName && firstName.length > 50) {
    throw new ServiceValidationError(
      'Your first name must be less than 50 characters.'
    )
  }

  // Check name one word with only letters and numbers
  if (slug) {
    if (slug.length < 5) {
      throw new ServiceValidationError(
        'Slug must be at least 5 characters long'
      )
    }

    // Ensure name is only alphanumeric no spaces
    if (slug.match(/[^a-z0-9]+/g)) {
      throw new ServiceValidationError(
        'Slug must be one word with only lowercase letters and numbers'
      )
    }

    if (slug === context.currentUser.slug) {
      throw new ServiceValidationError('Slug must be new')
    }
  }

  const updatedUser = await db.user.update({
    where: {
      id: context.currentUser.id,
    },
    data: {
      firstName,
      lastName,
      shortBio,
      emailMarketing,
      slug,
    },
  })

  await setUserRedis(updatedUser)
  await recreateAllScopes(updatedUser)

  return {
    id: updatedUser.id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    isAdmin: updatedUser.isAdmin,
    emailVerified: updatedUser.emailVerified,
    shortBio: updatedUser.shortBio,
    profilePicture: gravatarUrl(updatedUser.email, {
      default: 'mp',
    }),
    emailMarketing: updatedUser.emailMarketing,
    slug: updatedUser.slug,
  }
}
