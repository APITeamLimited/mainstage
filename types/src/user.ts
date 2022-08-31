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
