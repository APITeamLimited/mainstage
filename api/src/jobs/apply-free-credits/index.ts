import type { Queue } from 'bullmq'

import { db } from 'src/lib/db'

import { processFreeCredits } from './process-free-credits'

// Searches teams and users and applies free credits to any that are eligible
export const registerRecurringCreditsJob = async (queue: Queue) => {
  // Repeat every day at 1 am
  await queue.add(
    'applyFreeCredits',
    {},
    {
      repeat: {
        pattern: '0 * * * *',
      },
    }
  )

  // Run immediately
  applyFreeCredits().catch((e) => {
    console.log(e)
  })
}

export const applyFreeCredits = async (force = false, slow = false) => {
  await applyTeamFreeCredits(force, slow)
  await applyUserFreeCredits(force, slow)
}

const applyTeamFreeCredits = async (force: boolean, slow: boolean) => {
  // Sort teams by latest freeCreditsUpdatedAt
  let offset = 0
  let batchSize = 100

  // Loop through teams and apply free credits
  do {
    let teams = await db.team.findMany({
      orderBy: { freeCreditsAddedAt: 'desc' },

      // Only return 100 teams at a time
      take: 100,
      skip: offset,

      select: {
        id: true,
        planInfo: true,
        freeCreditsAddedAt: true,
        pastDue: true,
      },
    })

    // Loop through teams and apply free credits
    if (teams.length === 0) {
      break
    }

    // Filter after iterator break condition to avoid skipping teams
    teams = teams.filter((team) =>
      force
        ? true
        : team.freeCreditsAddedAt
        ? new Date(team.freeCreditsAddedAt).getTime() <
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        : true
    )

    for (const team of teams) {
      if (slow) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      await processFreeCredits({ team }).catch((e) => {
        console.error('Error processing team free credits', team, e)
      })
    }

    offset += teams.length
    batchSize = teams.length
  } while (batchSize > 0)
}

const applyUserFreeCredits = async (force: boolean, slow: boolean) => {
  // Sort users by latest freeCreditsUpdatedAt
  let offset = 0
  let batchSize = 100

  // Loop through users and apply free credits
  // Only select freeCreditsAddedAt more than 30 days ago
  do {
    let users = await db.user.findMany({
      orderBy: { freeCreditsAddedAt: 'desc' },

      // Only return 100 users at a time
      take: 100,
      skip: offset,

      select: {
        id: true,
        planInfo: true,
        freeCreditsAddedAt: true,
        pastDue: true,
      },
    })

    // Loop through users and apply free credits
    if (users.length === 0) {
      break
    }

    // Filter after iterator break condition to avoid skipping users
    users = users.filter((user) =>
      force
        ? true
        : user.freeCreditsAddedAt
        ? new Date(user.freeCreditsAddedAt).getTime() <
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        : true
    )

    for (const user of users) {
      if (slow) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // If one fails, don't stop the whole batch
      await processFreeCredits({ user }).catch((e) => {
        console.error('Error processing user free credits', user, e)
      })
    }

    offset += users.length
    batchSize = users.length
  } while (batchSize > 0)
}
