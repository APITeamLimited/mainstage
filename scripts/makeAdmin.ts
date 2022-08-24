import { db } from 'api/src/lib/db'
import yargs from 'yargs/yargs'

export default async () => {
  const argv = yargs(process.argv.slice(2)).options({
    email: { type: 'string', demandOption: true },
  }).argv

  const user = await db.user.findFirst({
    where: { email: argv.email },
  })

  if (!user) {
    throw new Error(`User not found: ${argv.email}`)
  }

  await db.user.update({
    where: { id: user.id },
    data: { isAdmin: true },
  })

  console.log(`User ${user.email} is now an admin.`)
}
