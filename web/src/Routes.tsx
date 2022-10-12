import { ROUTES } from '@apiteam/types/src/routes'

import { Router, Route, Set, Private } from '@redwoodjs/router'

import { AppUnifiedLayout } from './layouts/App'
import { LandingLayoutSplash, LandingLayoutContained } from './layouts/Landing'

export type LandingGroup = {
  name: string
  sublinks: Array<{
    path: string
    name: string
    includeAppBar?: boolean
  }>
  includeAppBar?: boolean
}

export const brandedRoutes = [
  {
    name: 'Platform',
    sublinks: [
      {
        path: '/platform/why-apiteam',
        name: 'Why APITeam',
      },
      {
        path: '/pricing',
        name: 'Pricing',
        includeAppBar: false,
      },
      {
        path: '/platform/collection-editor',
        name: 'Collection Editor',
      },
      {
        path: '/platform/globe-test',
        name: 'Globe Test',
      },
      {
        path: '/platform/api-publishing',
        name: 'API Publishing',
      },
      {
        path: '/docs',
        name: 'Docs',
        includeAppBar: false,
      },
    ],
  },
  {
    name: 'Company',
    sublinks: [
      {
        path: '/company/about',
        name: 'About',
      },
      {
        path: '/blog',
        name: 'Blog',
      },
      {
        path: '/contact',
        name: 'Contact Us',
      },
    ],
    includeAppBar: false,
  },
  {
    name: 'Legal',
    sublinks: [
      {
        path: '/legal/terms-of-service',
        name: 'Terms of Service',
      },
      {
        path: '/legal/privacy-policy',
        name: 'Privacy Policy',
      },
      {
        path: '/legal/cookie-policy',
        name: 'Cookie Policy',
      },
    ],
    includeAppBar: false,
  },
] as LandingGroup[]

const Routes = () => {
  return (
    <Router>
      <Set wrap={LandingLayoutSplash}>
        <Route path="/" page={RootPage} name="splash" />
      </Set>
      <Set wrap={LandingLayoutContained}>
        <Route path="/platform/why-apiteam" page={WhyAPITeamPage} name="whyAPITeam" />
        <Route path="/platform/pricing" page={PricingPage} name="pricing" />
        <Route path="/company/about" page={AboutPage} name="about" />
        <Route path="/contact" page={ContactPage} name="contact" />
        <Route path="/legal/terms-of-service" page={TermsOfServicePage} name="termsOfService" />
        <Route path={ROUTES.privacyPolicy} page={PrivacyPolicyPage} name="privacyPolicy" />
        <Route path={ROUTES.cookiePolicy} page={CookiePolicyPage} name="cookiePolicy" />
        <Route path={ROUTES.supportCenter} page={PrivacyPolicyPage} name="supportCenter" />
        <Route path={ROUTES.docs} page={PrivacyPolicyPage} name="docs" />
        <Route path={ROUTES.blog} page={PrivacyPolicyPage} name="blog" />
      </Set>
      <Route path={ROUTES.acceptInvitation} page={AcceptInvitationPage} name="acceptInvitation" />
      <Route path={ROUTES.declineInvitation} page={DeclineInvitationPage} name="declineInvitation" />
      <Route path={ROUTES.login} page={LoginPage} name="login" />
      <Route path={ROUTES.signup} page={SignupPage} name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
      <Route path={ROUTES.userUnsubscribe} page={ResetPasswordPage} name="userUnsubscribe" />
      <Route path={ROUTES.blanketUnsubscribe} page={ResetPasswordPage} name="blanketUnsubscribe" />
      <Route path={ROUTES.verifyEmail} page={ResetPasswordPage} name="verifyEmail" />
      <Route path={ROUTES.deleteAccount} page={DeleteAccountPage} name="deleteAccount" />
      <Route path={ROUTES.deleteTeam} page={DeleteTeamPage} name="deleteTeam" />
      <Route path={ROUTES.changeOwner} page={ChangeOwnerPage} name="changeOwner" />
      {/* TODO: Re-enable local workspaces when done cloud*/}
      <Private unauthenticated="login">
        <Set wrap={AppUnifiedLayout}>
          <Route path="/app" redirect={ROUTES.dashboard} />
          <Route path={ROUTES.dashboard} page={AppDashboardOverviewPage} name="dashboard" />
          <Route path={ROUTES.settingsWorkspace} page={AppDashboardSettingsPagesGeneralSettingsPage} name="settingsWorkspace" />
          <Route path={ROUTES.settingsWorkspaceMembers} page={AppDashboardSettingsPagesMembersSettingsPage} name="settingsWorkspaceMembers" />
          <Route path={ROUTES.settingsWorkspaceDangerZone} page={AppDashboardSettingsPagesDangerZoneSettingsPage} name="settingsWorkspaceDangerZone" />
          <Route path={ROUTES.domains} page={AppDashboardDomainsPage} name="domains" />
          <Route path={ROUTES.collectionEditor} page={AppCollectionEditorPage} name="collectionEditor" />
        </Set>
      </Private>
      <Private unauthenticated="login">
        <Route path={ROUTES.admin} page={AdminPage} name="admin" />
      </Private>
      <Route prerender notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
