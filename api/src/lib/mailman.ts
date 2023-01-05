import { MailmanInput, MailmanOutput } from '@apiteam/mailman'
import sgMail from '@sendgrid/mail'
import { createClient } from 'redis'
import { v4 as uuid } from 'uuid'

import { checkValue } from 'src/config'

const mailmanUserName = checkValue<string>('mailman.redis.userName')
const mailmanPassword = checkValue<string>('mailman.redis.password')
const mailmanHost = checkValue<string>('mailman.redis.host')
const mailmanPort = checkValue<number>('mailman.redis.port')

const mailmanReadRedis = createClient({
  url: `redis://${mailmanUserName}:${mailmanPassword}@${mailmanHost}:${mailmanPort}`,
})

const mailmanSubscribeRedis = mailmanReadRedis.duplicate()

mailmanReadRedis.connect()
mailmanSubscribeRedis.connect()

sgMail.setApiKey(checkValue<string>('api.mail.sendgridAPIKey'))

export const dispatchEmail = async (input: MailmanInput<unknown>) => {
  const jobId = uuid()

  // TODO: Abort if user opted out of emails

  await Promise.all([
    mailmanReadRedis.hSet(jobId, 'id', jobId),
    mailmanReadRedis.hSet(jobId, 'input', JSON.stringify(input)),
  ])

  const [_1, _2, output] = await Promise.all([
    mailmanReadRedis.sAdd('queuedRenderJobs', jobId),
    mailmanReadRedis.publish('renderRequest', jobId),
    new Promise<MailmanOutput>((resolve) => {
      mailmanSubscribeRedis.subscribe(`renderResponse:${jobId}`, (message) => {
        mailmanSubscribeRedis.unsubscribe(`renderResponse:${jobId}`)
        resolve(JSON.parse(message))
      })
    }),
  ])

  if (!output.content) throw new Error('Failed to render email')

  // Use smtp for now until sendgrid api access
  await Promise.all([
    handleSendgridSend(input.to, output),
    mailmanReadRedis.del(jobId),
    mailmanReadRedis.sRem('queuedRenderJobs', jobId),
  ])
}

const handleSendgridSend = async (to: string, output: MailmanOutput) => {
  if (!output.content) throw new Error('No content to send')

  const msg = {
    to,
    from: {
      email: checkValue<string>('api.mail.from.email'),
      name: checkValue<string>('api.mail.from.name'),
    },
    subject: output.content.title,
    html: output.content.html,
    text: output.content.text,
  }

  await sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error)

      if (error.response) {
        console.error(error.response.body)
      }
    }
  )
}
