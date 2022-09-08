import { MailmanInput } from 'src/lib'

import {
  ForgotPassword,
  forgotPasswordText,
  forgotPasswordTitle,
} from './ForgotPassword'
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
import {
  NotifyPasswordReset,
  notifyPasswordResetText,
  notifyPasswordResetTitle,
} from './NotifyPasswordReset'
import {
  SignupWelcome,
  signupWelcomeText,
  signupWelcomeTitle,
} from './SignupWelcome'
import {
  TeamInvitation,
  teamInvitationText,
  teamInvitationTitle,
} from './TeamInvitation'
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
  'team-invitation': {
    html: TeamInvitation,
    text: teamInvitationText,
    title: teamInvitationTitle,
  },
  'signup-welcome': {
    html: SignupWelcome,
    text: signupWelcomeText,
    title: signupWelcomeTitle,
  },
  'forgot-password': {
    html: ForgotPassword,
    text: forgotPasswordText,
    title: forgotPasswordTitle,
  },
  'notify-password-reset': {
    html: NotifyPasswordReset,
    text: notifyPasswordResetText,
    title: notifyPasswordResetTitle,
  },
} as const as EmailTemplateSchema

export type TemplateIdentifier =
  | 'verify-email'
  | 'notify-accept-invitation'
  | 'notify-decline-invitation'
  | 'team-invitation'
  | 'signup-welcome'
  | 'forgot-password'
  | 'notify-password-reset'

export { TeamInvitationData } from './TeamInvitation'
export { NotifyAcceptInvitationData } from './NotifyAcceptInvitation'
export { NotifyDeclineInvitationData } from './NotifyDeclineInvitaiton'
export { VerifyEmailData } from './VerifyEmail'
export { SignupWelcomeData } from './SignupWelcome'
export { ForgotPasswordData } from './ForgotPassword'
export { NotifyPasswordResetData } from './NotifyPasswordReset'
