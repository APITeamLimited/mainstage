import { ROUTES } from '@apiteam/types'

import { Router, Route, Set, Private } from '@redwoodjs/router'

import { generateDocRoutes } from 'src/layouts/Docs/routing'

import { AppUnifiedLayout } from './layouts/App'
import { DocsLayout } from './layouts/Docs/DocsLayout'
import { LandingLayoutSplash, LandingLayoutContained } from './layouts/Landing'

export type LandingGroup = {
  name: string
  sublinks: Array<{
    path: string
    name: string
    hideInAppBar?: boolean
  }>
  hideInAppBar?: boolean
}

export const brandedRoutes = [
  {
    name: 'Platform',
    sublinks: [
      {
        path: ROUTES.apiClient,
        name: 'API Client',
      },
      {
        path: ROUTES.loadTesting,
        name: 'Load Testing',
      },
      {
        path: ROUTES.agent,
        name: 'APITeam Agent',
      },
      {
        path: ROUTES.plansAndPricing,
        name: 'Plans and Pricing',
      },
      {
        path: ROUTES.docs,
        name: 'Docs',
      },
    ],
  },
  {
    name: 'About',
    sublinks: [
      // TODO: When built up more of a presence, we can add this back in
      // {
      //   path: ROUTES.aboutUs,
      //   name: 'About Us',
      // },
      {
        path: ROUTES.openSource,
        name: 'Open Source',
      },
      // {
      //   path: ROUTES.blog,
      //   name: 'Blog',
      // },
      {
        path: ROUTES.contact,
        name: 'Contact Us',
      },
    ],
    hideInAppBar: true,
  },
  {
    name: 'Legal',
    sublinks: [
      {
        path: ROUTES.termsOfService,
        name: 'Terms of Service',
      },
      {
        path: ROUTES.privacyPolicy,
        name: 'Privacy Policy',
      },
      {
        path: ROUTES.cookiePolicy,
        name: 'Cookie Policy',
      },
    ],
    hideInAppBar: true,
  },
] as LandingGroup[]

const Routes = () => {
  return (
    <Router>
      <Set wrap={LandingLayoutSplash}>
        <Route path="/" page={SplashPage} name="splash" />
      </Set>
      <Set wrap={LandingLayoutContained}>
        <Route path={ROUTES.apiClient} page={APIClientPage} name="apiClient" />
        <Route path={ROUTES.loadTesting} page={LoadTestingPage} name="loadTesting" />
        <Route path={ROUTES.plansAndPricing} page={PlansAndPricingPage} name="plansAndPricing" />
        {/* <Route path={ROUTES.aboutUs} page={AboutPage} name="about" /> */}
        <Route path={ROUTES.openSource} page={OpenSourcePage} name="openSource" />
        <Route path={ROUTES.contact} page={ContactPage} name="contact" />
        <Route path={ROUTES.termsOfService} page={TermsOfServicePage} name="termsOfService" />
        <Route path={ROUTES.privacyPolicy} page={PrivacyPolicyPage} name="privacyPolicy" />
        <Route path={ROUTES.cookiePolicy} page={CookiePolicyPage} name="cookiePolicy" />
        {/* <Route path={ROUTES.support} page={SupportPage} name="support" /> */}
        <Route path={ROUTES.blog} page={PrivacyPolicyPage} name="blog" />
        <Route path={ROUTES.agent} page={AgentPage} name="agent" />
      </Set>
      <Set wrap={DocsLayout}>{generateDocRoutes()}</Set>
      <Private unauthenticated="login">
        <Set wrap={AppUnifiedLayout}>
          <Route path="/app" redirect={ROUTES.dashboard} />
          <Route path={ROUTES.dashboard} page={AppDashboardOverviewPage} name="dashboard" />
          <Route path={ROUTES.settingsWorkspace} page={AppDashboardSettingsPagesGeneralSettingsPage} name="settingsWorkspace" />
          <Route path={ROUTES.settingsWorkspaceMembers} page={AppDashboardSettingsPagesMembersSettingsPage} name="settingsWorkspaceMembers" />
          <Route path={ROUTES.settingsWorkspaceDangerZone} page={AppDashboardSettingsPagesDangerZoneSettingsPage} name="settingsWorkspaceDangerZone" />
          <Route path={ROUTES.settingsWorkspaceBilling} page={AppDashboardSettingsPagesBillingSettingsPage} name="settingsWorkspaceBilling" />
          <Route path={ROUTES.settingsWorkspaceInvoices} page={AppDashboardSettingsPagesInvoicesSettingsPage} name="settingsWorkspaceInvoices" />
          <Route path={ROUTES.domains} page={AppDashboardDomainsPage} name="domains" />
          <Route path={ROUTES.editor} page={AppEditorPage} name="editor" />
        </Set>
      </Private>
      <Private unauthenticated="login">
        <Route path={ROUTES.admin} page={AdminPage} name="admin" />
      </Private>
      <Route prerender notfound page={NotFoundPage} />
      <Route path={ROUTES.acceptInvitation} page={AcceptInvitationPage} name="acceptInvitation" />
      <Route path={ROUTES.declineInvitation} page={DeclineInvitationPage} name="declineInvitation" />
      <Route path={ROUTES.login} page={LoginPage} name="login" />
      <Route path={ROUTES.signup} page={SignupPage} name="signup" />
      <Route path={ROUTES.forgotPassword} page={ForgotPasswordPage} name="forgotPassword" />
      <Route path={ROUTES.resetPassword} page={ResetPasswordPage} name="resetPassword" />
      <Route path={ROUTES.userUnsubscribe} page={ResetPasswordPage} name="userUnsubscribe" />
      <Route path={ROUTES.blanketUnsubscribe} page={ResetPasswordPage} name="blanketUnsubscribe" />
      <Route path={ROUTES.verifyEmail} page={ResetPasswordPage} name="verifyEmail" />
      <Route path={ROUTES.deleteAccount} page={DeleteAccountPage} name="deleteAccount" />
      <Route path={ROUTES.deleteTeam} page={DeleteTeamPage} name="deleteTeam" />
      <Route path={ROUTES.changeOwner} page={ChangeOwnerPage} name="changeOwner" />
    </Router>
  )
}

export default Routes
