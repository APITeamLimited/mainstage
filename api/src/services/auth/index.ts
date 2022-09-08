import { VerifyEmailData } from '@apiteam/mailman'

import { generateBlanketUnsubscribeUrl } from 'src/helpers/routing'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'

export const getVerificationCode = async ({
  firstName,
  email,
}: {
  firstName: string
  email: string
}) => {
  // Firs check email is available
  if (await coreCacheReadRedis.get(`user__email:${email}`)) {
    return false
  }

  // Create 6 digit number
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

  // Add verifyCode to set and expire in 15 minutes
  await coreCacheReadRedis.set(
    `verificationCode__email__code:${email}:${verifyCode}`,
    verifyCode
  )
  await coreCacheReadRedis.expire(
    `verificationCode__email__code:${email}:${verifyCode}`,
    60 * 15
  )

  await dispatchEmail({
    to: email,
    template: 'verify-email',
    data: {
      firstName,
      verifyCode,
    } as VerifyEmailData,
    blanketUnsubscribeUrl: await generateBlanketUnsubscribeUrl(email),
    userUnsubscribeUrl: null,
  })

  return true
}
