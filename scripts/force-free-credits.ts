import { applyFreeCredits } from 'api/src/jobs/apply-free-credits'

export default async () => {
  console.log('Adding free credits to all users and teams')

  await applyFreeCredits(true, true)

  console.log('Free credits added')
}
