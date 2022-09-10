import { eeReadRedis } from '../redis'

export const deleteTeam = async (teamId: string) => {
  await eeReadRedis.del(`TEAM:${teamId}`)
}

export const deleteUser = async (userId: string) => {
  await eeReadRedis.del(`USER:${userId}`)
}
