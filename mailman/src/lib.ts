import {
  TemplateData,
  TemplateIdentifier,
  ValidTemplateData,
} from './templates'

export type MailmanJob = {
  id: string
  assignedId: string | null
  input: MailmanInput<any>
  output?: MailmanOutput
}

export type MailmanInput<T extends TemplateData> = {
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
