import { User } from '@prisma/client'

export type SafeUser = Omit<
  User,
  | 'hashedPassword'
  | 'salt'
  | 'resetPasswordToken'
  | 'resetPasswordExpires'
  | 'resetToken'
  | 'resetTokenExpiresAt'
>

export const getDisplayName = (user: SafeUser) => {
  const firstName = user.firstName
    .slice(0, 1)
    .toUpperCase()
    .concat(user.firstName.slice(1))

  const lastName = user.lastName
    .slice(0, 1)
    .toUpperCase()
    .concat(user.lastName.slice(1))

  return `${firstName} ${lastName}`
}
