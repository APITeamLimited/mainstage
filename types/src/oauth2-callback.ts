import { z } from 'zod'

// What is returned back in the callback from the OAuth2 provider
export const apiteamOAuth2CallbackSchema = z
  .object({
    state: z.string(),
    code: z.string(),
  })
  // Allow additional properties
  .catchall(z.unknown())

export type ApiteamOAuth2Callback = z.infer<typeof apiteamOAuth2CallbackSchema>

export type APITeamOAuthCodeInfo = {
  userID: string
  apiteamOAuth2Code: string
  returnResult: ApiteamOAuth2Callback | null
}
