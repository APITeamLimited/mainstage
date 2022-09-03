import { Team, Scope, Membership } from '@prisma/client'

export type RedisTeamPublishMessage =
  | {
      type: 'REMOVE_MEMBER'
      payload: Membership
    }
  | {
      type: 'ADD_MEMBER'
      payload: Membership
    }
  | {
      type: 'CHANGE_ROLE'
      payload: Membership
    }
  | {
      type: 'LAST_ONLINE_TIME'
      payload: {
        userId: string
        lastOnline: Date
      }
    }

/*
Helper function for not null issue
*/
export const ensureCorrectType = (value: string | null): string | null => {
  if (value === 'null') return null
  return value
}
