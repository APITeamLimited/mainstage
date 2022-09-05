import { TemplateIdentifier } from './templates'

export type MailmanJob = {
  id: string
  assignedId: string | null
  input: MailmanInput<unknown>
  output?: MailmanOutput
}

export type MailmanInput<T> = {
  data: T
  to: string
  template: TemplateIdentifier
  userUnsubscribeUrl: string | null
  blanketUnsubscribeUrl: string
}

export type MailmanOutput = {
  content: {
    title: string
    html: string
    text: string
  } | null
  error?: string | null
}
