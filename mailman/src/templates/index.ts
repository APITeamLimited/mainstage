import { MailmanInput } from 'src/lib'

import {
  NotifyAcceptInvitation,
  notifyAcceptInvitationText,
  notifyAcceptInvitationTitle,
} from './NotifyAcceptInvitation'
import {
  NotifyDeclineInvitation,
  notifyDeclineInvitationText,
  notifyDeclineInvitationTitle,
} from './NotifyDeclineInvitaiton'
import { VerifyEmail, verifyEmailText, verifyEmailTitle } from './VerifyEmail'

type EmailTemplateSchema = {
  [key: string]: {
    html: (input: MailmanInput<unknown>) => JSX.Element
    text: (input: MailmanInput<unknown>) => string
    title: (input: MailmanInput<unknown>) => string
  }
}

export const VALID_TEMPLATES = {
  'verify-email': {
    html: VerifyEmail,
    text: verifyEmailText,
    title: verifyEmailTitle,
  },
  'notify-accept-invitation': {
    html: NotifyAcceptInvitation,
    text: notifyAcceptInvitationText,
    title: notifyAcceptInvitationTitle,
  },
  'notify-decline-invitation': {
    html: NotifyDeclineInvitation,
    text: notifyDeclineInvitationText,
    title: notifyDeclineInvitationTitle,
  },
} as const as EmailTemplateSchema

export type TemplateIdentifier = keyof typeof VALID_TEMPLATES
