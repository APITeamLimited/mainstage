import { db } from 'api/src/lib/db'
import { UserModel } from 'api/src/models'
import yargs from 'yargs/yargs'

export default async () => {
  const argv = yargs(process.argv.slice(2)).options({
    email: { type: 'string', demandOption: true },
  }).argv

  console.log(`Making user ${argv['email']} an admin...`)

  const user = await db.user.findFirst({
    where: { email: argv['email'] },
  })

  if (!user) {
    throw new Error(`User not found: ${argv['email']}`)
  }

  await UserModel.update(user.id, { isAdmin: true })

  console.log(`User ${user.email} is now an admin.`)
}
