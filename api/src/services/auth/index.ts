import { VerifyEmailData } from '@apiteam/mailman'
import axios from 'axios'

import { ServiceValidationError } from '@redwoodjs/api'

import { checkValue } from 'src/config'
import { generateBlanketUnsubscribeUrl } from 'src/helpers/routing'
import { dispatchEmail } from 'src/lib/mailman'
import { coreCacheReadRedis } from 'src/lib/redis'

export const getVerificationCode = async ({
  firstName,
  email,
  recaptchaToken,
}: {
  firstName: string
  email: string
  recaptchaToken: string
}): Promise<boolean> => {
  // Firsy check email is available
  if (await coreCacheReadRedis.get(`user__email:${email}`)) {
    throw new ServiceValidationError('Email already in use.')
  }

  // Validate token
  const tokenValidationResult = await validateToken(recaptchaToken)

  if (!tokenValidationResult.success) {
    throw new ServiceValidationError(tokenValidationResult.failureReason)
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
const recaptchaEndpoint = 'https://www.google.com/recaptcha/api/siteverify'

const recaptchaSecret = checkValue<string>('recaptcha.secretKey')

type TokenValidationResult =
  | {
      success: true
    }
  | {
      success: false
      failureReason: string
    }

type ValidationServerResponse = {
  success: boolean
  'error-codes'?: string[]
}

const validateToken = async (token: string): Promise<TokenValidationResult> => {
  const response = await axios
    .post(
      recaptchaEndpoint,
      new URLSearchParams({
        secret: recaptchaSecret,
        response: token,
      }),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      }
    )
    .catch((err) => {
      console.error(err, response)
      return null
    })

  if (!response || response.status !== 200) {
    return {
      success: false,
      failureReason: 'Failed to connect verification server, contact support.',
    }
  }

  const data = response.data as ValidationServerResponse

  if (!data.success) {
    const errorCodes = data['error-codes'] ?? ['an unknown error occurred']

    return {
      success: false,
      failureReason: `Failed to verify token, ${errorCodes.join(', ')}.`,
    }
  }

  return {
    success: true,
  }
}
