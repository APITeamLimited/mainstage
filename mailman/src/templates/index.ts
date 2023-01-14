import {
  ConfirmAccountDelete,
  ConfirmAccountDeleteData,
  confirmAccountDeleteText,
  confirmAccountDeleteTitle,
} from './ConfirmAccountDelete'
import {
  ConfirmChangeOwner,
  ConfirmChangeOwnerData,
  confirmChangeOwnerText,
  confirmChangeOwnerTitle,
} from './ConfirmChangeOwner'
import {
  ConfirmTeamDelete,
  ConfirmTeamDeleteData,
  confirmTeamDeleteText,
  confirmTeamDeleteTitle,
} from './ConfirmTeamDelete'
import {
  ForgotPassword,
  ForgotPasswordData,
  forgotPasswordText,
  forgotPasswordTitle,
} from './ForgotPassword'
import {
  NotifyAcceptInvitation,
  NotifyAcceptInvitationData,
  notifyAcceptInvitationText,
  notifyAcceptInvitationTitle,
} from './NotifyAcceptInvitation'
import {
  NotifyAccountDeleted,
  NotifyAccountDeletedData,
  notifyAccountDeletedText,
  notifyAccountDeletedTitle,
} from './NotifyAccountDeleted'
import {
  NotifyDeclineInvitation,
  NotifyDeclineInvitationData,
  notifyDeclineInvitationText,
  notifyDeclineInvitationTitle,
} from './NotifyDeclineInvitation'
import {
  NotifyDowngradeAtPeriodEnd,
  NotifyDowngradeAtPeriodEndData,
  notifyDowngradeAtPeriodEndText,
  notifyDowngradeAtPeriodEndTitle,
} from './NotifyDowngradeAtPeriodEnd'
import {
  NotifyDowngradeFreeTier,
  NotifyDowngradeFreeTierData,
  notifyDowngradeFreeTierText,
  notifyDowngradeFreeTierTitle,
} from './NotifyDowngradeFreeTier'
import {
  NotifyInvoice,
  NotifyInvoiceData,
  notifyInvoiceText,
  notifyInvoiceTitle,
} from './NotifyInvoice'
import {
  NotifyMemberLeft,
  NotifyMemberLeftData,
  notifyMemberLeftText,
  notifyMemberLeftTitle,
} from './NotifyMemberLeft'
import {
  NotifyNewOwner,
  NotifyNewOwnerData,
  NotifyNewOwnerText,
  NotifyNewOwnerTitle,
} from './NotifyNewOwner'
import {
  NotifyNewRole,
  NotifyNewRoleData,
  notifyNewRoleText,
  notifyNewRoleTitle,
} from './NotifyNewRole'
import {
  NotifyOldOwner,
  NotifyOldOwnerData,
  NotifyOldOwnerText,
  NotifyOldOwnerTitle,
} from './NotifyOldOwner'
import {
  NotifyPasswordReset,
  NotifyPasswordResetData,
  notifyPasswordResetText,
  notifyPasswordResetTitle,
} from './NotifyPasswordReset'
import {
  NotifyPaymentActionRequired,
  NotifyPaymentActionRequiredData,
  notifyPaymentActionRequiredText,
  notifyPaymentActionRequiredTitle,
} from './NotifyPaymentActionRequired'
import {
  NotifyPaymentFailed,
  NotifyPaymentFailedData,
  notifyPaymentFailedText,
  notifyPaymentFailedTitle,
} from './NotifyPaymentFailed'
import {
  NotifyPaymentSuccessful,
  NotifyPaymentSuccessfulData,
  notifyPaymentSuccessfulText,
  notifyPaymentSuccessfulTitle,
} from './NotifyPaymentSuccessful'
import {
  NotifyRemovedFromTeam,
  NotifyRemovedFromTeamData,
  notifyRemovedFromTeamText,
  notifyRemovedFromTeamTitle,
} from './NotifyRemovedFromTeam'
import {
  NotifyRemovedFromTeamDowngrade,
  NotifyRemovedFromTeamDowngradeData,
  notifyRemovedFromTeamDowngradeText,
  notifyRemovedFromTeamDowngradeTitle,
} from './NotifyRemovedFromTeamDowngrade'
import {
  NotifyTeamDeleted,
  NotifyTeamDeletedData,
  notifyTeamDeletedText,
  notifyTeamDeletedTitle,
} from './NotifyTeamDeleted'
import {
  NotifyTrialExpiring,
  NotifyTrialExpiringData,
  notifyTrialExpiringText,
  notifyTrialExpiringTitle,
} from './NotifyTrialExpiring'
import {
  NotifyWelcomeToPro,
  NotifyWelcomeToProData,
  notifyWelcomeToProText,
  notifyWelcomeToProTitle,
} from './NotifyWelcomeToPro'
import {
  SignupWelcome,
  SignupWelcomeData,
  signupWelcomeText,
  signupWelcomeTitle,
} from './SignupWelcome'
import {
  TeamInvitation,
  TeamInvitationData,
  teamInvitationText,
  teamInvitationTitle,
} from './TeamInvitation'
import {
  VerifyEmail,
  VerifyEmailData,
  verifyEmailText,
  verifyEmailTitle,
} from './VerifyEmail'

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
  'notify-member-left': {
    html: NotifyMemberLeft,
    text: notifyMemberLeftText,
    title: notifyMemberLeftTitle,
  },
  'notify-trial-expiring': {
    html: NotifyTrialExpiring,
    text: notifyTrialExpiringText,
    title: notifyTrialExpiringTitle,
  },
  'notify-downgrade-free-tier': {
    html: NotifyDowngradeFreeTier,
    text: notifyDowngradeFreeTierText,
    title: notifyDowngradeFreeTierTitle,
  },
  'notify-welcome-to-pro': {
    html: NotifyWelcomeToPro,
    text: notifyWelcomeToProText,
    title: notifyWelcomeToProTitle,
  },
  'notify-payment-failed': {
    html: NotifyPaymentFailed,
    text: notifyPaymentFailedText,
    title: notifyPaymentFailedTitle,
  },
  'notify-payment-successful': {
    html: NotifyPaymentSuccessful,
    text: notifyPaymentSuccessfulText,
    title: notifyPaymentSuccessfulTitle,
  },
  'notify-new-invoice': {
    html: NotifyInvoice,
    text: notifyInvoiceText,
    title: notifyInvoiceTitle,
  },
  'notify-payment-action-required': {
    html: NotifyPaymentActionRequired,
    text: notifyPaymentActionRequiredText,
    title: notifyPaymentActionRequiredTitle,
  },
  'notify-downgrade-at-period-end': {
    html: NotifyDowngradeAtPeriodEnd,
    text: notifyDowngradeAtPeriodEndText,
    title: notifyDowngradeAtPeriodEndTitle,
  },
  'notify-removed-from-team-downgrade': {
    html: NotifyRemovedFromTeamDowngrade,
    text: notifyRemovedFromTeamDowngradeText,
    title: notifyRemovedFromTeamDowngradeTitle,
  },
} as const

export type ValidTemplateData = {
  'verify-email': VerifyEmailData
  'notify-accept-invitation': NotifyAcceptInvitationData
  'notify-decline-invitation': NotifyDeclineInvitationData
  'team-invitation': TeamInvitationData
  'signup-welcome': SignupWelcomeData
  'forgot-password': ForgotPasswordData
  'notify-password-reset': NotifyPasswordResetData
  'notify-new-role': NotifyNewRoleData
  'confirm-team-delete': ConfirmTeamDeleteData
  'notify-team-deleted': NotifyTeamDeletedData
  'confirm-account-delete': ConfirmAccountDeleteData
  'notify-account-deleted': NotifyAccountDeletedData
  'notify-removed-from-team': NotifyRemovedFromTeamData
  'confirm-change-owner': ConfirmChangeOwnerData
  'notify-new-owner': NotifyNewOwnerData
  'notify-old-owner': NotifyOldOwnerData
  'notify-member-left': NotifyMemberLeftData
  'notify-trial-expiring': NotifyTrialExpiringData
  'notify-downgrade-free-tier': NotifyDowngradeFreeTierData
  'notify-welcome-to-pro': NotifyWelcomeToProData
  'notify-payment-failed': NotifyPaymentFailedData
  'notify-payment-successful': NotifyPaymentSuccessfulData
  'notify-new-invoice': NotifyInvoiceData
  'notify-payment-action-required': NotifyPaymentActionRequiredData
  'notify-downgrade-at-period-end': NotifyDowngradeAtPeriodEndData
  'notify-removed-from-team-downgrade': NotifyRemovedFromTeamDowngradeData
}

export type TemplateIdentifier = keyof ValidTemplateData

export type TemplateData = ValidTemplateData[TemplateIdentifier]

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
export { NotifyMemberLeftData } from './NotifyMemberLeft'
export { NotifyTrialExpiringData } from './NotifyTrialExpiring'
export { NotifyDowngradeFreeTierData } from './NotifyDowngradeFreeTier'
export { NotifyWelcomeToProData } from './NotifyWelcomeToPro'
export { NotifyPaymentFailedData } from './NotifyPaymentFailed'
export { NotifyPaymentSuccessfulData } from './NotifyPaymentSuccessful'
export { NotifyInvoiceData } from './NotifyInvoice'
export { NotifyPaymentActionRequiredData } from './NotifyPaymentActionRequired'
export { NotifyDowngradeAtPeriodEndData } from './NotifyDowngradeAtPeriodEnd'
export { NotifyRemovedFromTeamDowngradeData } from './NotifyRemovedFromTeamDowngrade'
