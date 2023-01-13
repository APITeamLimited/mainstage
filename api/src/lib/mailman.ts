import { MailmanInput, MailmanOutput, TemplateData } from '@apiteam/mailman'
import sgMail from '@sendgrid/mail'
import { createTransport } from 'nodemailer'
import { Options } from 'nodemailer/lib/mailer'
import { v4 as uuid } from 'uuid'

import { checkValue } from 'src/config'

import { getMailmanReadRedis, getMailmanSubscribeRedis } from './redis'

sgMail.setApiKey(checkValue<string>('api.mail.sendgridAPIKey'))

const smtpEnabled = checkValue<boolean>('api.mail.smtp.enabled')

export type DispatchEmailInput<T extends TemplateData> = MailmanInput<T> & {
  attachments?: {
    filename: string
    contentBase64: string
    contentType?: string
  }[]
}

export const dispatchEmail = async <T extends TemplateData>(
  input: DispatchEmailInput<T>
) => {
  const mailmanReadRedis = await getMailmanReadRedis()
  const mailmanSubscribeRedis = await getMailmanSubscribeRedis()

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

  if (!output.content) {
    throw new Error('Failed to render email')
  }

  await mailmanReadRedis.del(jobId)
  await mailmanReadRedis.sRem('queuedRenderJobs', jobId)

  const dispatchArgs = {
    to: input.to,
    output,
    attachments: input.attachments,
  }

  if (smtpEnabled) {
    await handleSMTPSend(dispatchArgs)
  } else {
    await handleSendgridSend(dispatchArgs)
  }
}

type DispatchArgs<T extends TemplateData> = {
  to: string
  output: MailmanOutput
  attachments: DispatchEmailInput<T>['attachments']
}

const handleSendgridSend = async <T extends TemplateData>({
  to,
  output,
  attachments,
}: DispatchArgs<T>) => {
  if (!output.content) throw new Error('No content to send')

  console.log(`Sending email to ${to} with subject ${output.content.title}`)

  const msg = {
    to,
    from: {
      email: checkValue<string>('api.mail.from.email'),
      name: checkValue<string>('api.mail.from.name'),
    },
    subject: output.content.title,
    html: output.content.html,
    text: output.content.text,
    attachments: attachments?.map((attachment) => ({
      content: attachment.contentBase64,
      filename: attachment.filename,
      type: attachment.contentType ?? 'text/plain',
      disposition: 'attachment',
    })),
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

const smtpTransport = smtpEnabled
  ? createTransport({
      host: checkValue<string>('api.mail.smtp.host'),
      port: checkValue<number>('api.mail.smtp.port'),
      auth: {
        user: checkValue<string>('api.mail.smtp.username'),
        pass: checkValue<string>('api.mail.smtp.password'),
      },
    })
  : undefined

const handleSMTPSend = async <T extends TemplateData>({
  to,
  output,
  attachments,
}: DispatchArgs<T>) => {
  if (!output.content) throw new Error('No content to send')

  if (!smtpTransport) throw new Error('SMTP not enabled')

  const msg: Options = {
    from: {
      name: checkValue<string>('api.mail.from.name'),
      address: checkValue<string>('api.mail.from.email'),
    },
    to,
    subject: output.content.title,
    html: output.content.html,
    text: output.content.text,
    attachments: attachments?.map((attachment) => ({
      content: attachment.contentBase64,
      filename: attachment.filename,
      contentType: attachment.contentType ?? 'text/plain',
      encoding: 'base64',
    })),
  }

  await smtpTransport.sendMail(msg)
}
