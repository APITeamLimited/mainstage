import {
  ConfirmAccountDelete,
  confirmAccountDeleteText,
  confirmAccountDeleteTitle,
} from './ConfirmAccountDelete'
import {
  ConfirmChangeOwner,
  confirmChangeOwnerText,
  confirmChangeOwnerTitle,
} from './ConfirmChangeOwner'
import {
  ConfirmTeamDelete,
  confirmTeamDeleteText,
  confirmTeamDeleteTitle,
} from './ConfirmTeamDelete'
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
  NotifyAccountDeleted,
  notifyAccountDeletedText,
  notifyAccountDeletedTitle,
} from './NotifyAccountDeleted'
import {
  NotifyDeclineInvitation,
  notifyDeclineInvitationText,
  notifyDeclineInvitationTitle,
} from './NotifyDeclineInvitation'
import {
  NotifyNewOwner,
  NotifyNewOwnerText,
  NotifyNewOwnerTitle,
} from './NotifyNewOwner'
import {
  NotifyNewRole,
  notifyNewRoleText,
  notifyNewRoleTitle,
} from './NotifyNewRole'
import {
  NotifyOldOwner,
  NotifyOldOwnerText,
  NotifyOldOwnerTitle,
} from './NotifyOldOwner'
import {
  NotifyPasswordReset,
  notifyPasswordResetText,
  notifyPasswordResetTitle,
} from './NotifyPasswordReset'
import {
  NotifyRemovedFromTeam,
  notifyRemovedFromTeamText,
  notifyRemovedFromTeamTitle,
} from './NotifyRemovedFromTeam'
import {
  NotifyTeamDeleted,
  notifyTeamDeletedText,
  notifyTeamDeletedTitle,
} from './NotifyTeamDeleted'
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
  'notify-new-role': {
    html: NotifyNewRole,
    text: notifyNewRoleText,
    title: notifyNewRoleTitle,
  },
  'confirm-team-delete': {
    html: ConfirmTeamDelete,
    text: confirmTeamDeleteText,
    title: confirmTeamDeleteTitle,
  },
  'notify-team-deleted': {
    html: NotifyTeamDeleted,
    text: notifyTeamDeletedText,
    title: notifyTeamDeletedTitle,
  },
  'confirm-account-delete': {
    html: ConfirmAccountDelete,
    text: confirmAccountDeleteText,
    title: confirmAccountDeleteTitle,
  },
  'notify-account-deleted': {
    html: NotifyAccountDeleted,
    text: notifyAccountDeletedText,
    title: notifyAccountDeletedTitle,
  },
  'notify-removed-from-team': {
    html: NotifyRemovedFromTeam,
    text: notifyRemovedFromTeamText,
    title: notifyRemovedFromTeamTitle,
  },
  'confirm-change-owner': {
    html: ConfirmChangeOwner,
    text: confirmChangeOwnerText,
    title: confirmChangeOwnerTitle,
  },
  'notify-new-owner': {
    html: NotifyNewOwner,
    text: NotifyNewOwnerText,
    title: NotifyNewOwnerTitle,
  },
  'notify-old-owner': {
    html: NotifyOldOwner,
    text: NotifyOldOwnerText,
    title: NotifyOldOwnerTitle,
  },
} as const

export type TemplateIdentifier = keyof typeof VALID_TEMPLATES

export { TeamInvitationData } from './TeamInvitation'
export { NotifyAcceptInvitationData } from './NotifyAcceptInvitation'
export { NotifyDeclineInvitationData } from './NotifyDeclineInvitation'
export { VerifyEmailData } from './VerifyEmail'
export { SignupWelcomeData } from './SignupWelcome'
export { ForgotPasswordData } from './ForgotPassword'
export { NotifyPasswordResetData } from './NotifyPasswordReset'
export { NotifyNewRoleData } from './NotifyNewRole'
export { ConfirmTeamDeleteData } from './ConfirmTeamDelete'
export { NotifyTeamDeletedData } from './NotifyTeamDeleted'
export { ConfirmAccountDeleteData } from './ConfirmAccountDelete'
export { NotifyAccountDeletedData } from './NotifyAccountDeleted'
export { NotifyRemovedFromTeamData } from './NotifyRemovedFromTeam'
export { ConfirmChangeOwnerData } from './ConfirmChangeOwner'
export { NotifyNewOwnerData } from './NotifyNewOwner'
export { NotifyOldOwnerData } from './NotifyOldOwner'
