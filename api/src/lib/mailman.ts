import { MailmanInput, MailmanOutput } from '@apiteam/mailman'
import nodemailer from 'nodemailer'
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

export const dispatchEmail = async (input: MailmanInput<unknown>) => {
  const jobId = uuid()

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
    handleSMTPSend(input.to, output),
    mailmanReadRedis.del(jobId),
    mailmanReadRedis.sRem('queuedRenderJobs', jobId),
  ])
}

let smtpTransporter: nodemailer.Transporter | null = null

const smtpHost = checkValue<string>('api.mail.smtp.host')
const smtpPort = checkValue<number>('api.mail.smtp.port')
const smtpUserName = checkValue<string>('api.mail.smtp.userName')
const smtpPassword = checkValue<string>('api.mail.smtp.password')

const handleSMTPSend = async (to: string, output: MailmanOutput) => {
  if (!output.content) throw new Error('No content to send')

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true,
      auth: {
        user: smtpUserName,
        pass: smtpPassword,
      },
    })
  }

  await smtpTransporter.sendMail({
    from: `${checkValue<string>('api.mail.from.name')} ${checkValue<string>(
      'api.mail.from.email'
    )}`,
    to,
    subject: output.content.title,
    html: output.content.html,
    text: output.content.text,
  })
}
