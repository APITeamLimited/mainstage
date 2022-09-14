import { ROUTES } from '@apiteam/types/dist/routes'

import { Router, Route, Set, Private } from '@redwoodjs/router'

import { AppUnifiedLayout } from './layouts/App'
import { LandingLayoutSplash, LandingLayoutContained } from './layouts/Landing'
import { CollectionEditorPage } from './pages/app/CollectionEditorPage'
import { DomainsPage } from './pages/app/dashboard/DomainsPage'
import { OverviewPage } from './pages/app/dashboard/OverviewPage'
import DangerZoneSettingsPage from './pages/app/dashboard/SettingsPages/DangerZoneSettingsPage/DangerZoneSettingsPage'
import GeneralSettingsPage from './pages/app/dashboard/SettingsPages/GeneralSettingsPage/GeneralSettingsPage'
import { MembersSettingsPage } from './pages/app/dashboard/SettingsPages/MembersSettingsPage/MembersSettingsPage'
import ChangeOwnerPage from './pages/ChangeOwnerPage/ChangeOwnerPage'
import AboutPage from './pages/company/AboutPage/AboutPage'
import ContactPage from './pages/company/ContactPage/ContactPage'
import DeleteTeamPage from './pages/DeleteTeamPage/DeleteTeamPage'
import CookiePolicyPage from './pages/legal/CookiePolicy/CookiePolicy'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicy/PrivacyPolicy'
import TermsOfServicePage from './pages/legal/TermsOfService/TermsOfService'
import PricingPage from './pages/platform/Pricing/Pricing'
import WhyAPITeamPage from './pages/platform/WhyAPITeam/WhyAPITeam'
import RootPage from './pages/splash/RootPage'

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
  /*{
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
  },*/
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
      <Set wrap={LandingLayoutSplash}>
        <Route path="/" page={RootPage} name="splash" />
      </Set>
      <Route path={ROUTES.acceptInvitation} page={AcceptInvitationPage} name="acceptInvitation" />
      <Route path={ROUTES.declineInvitation} page={DeclineInvitationPage} name="declineInvitation" />
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
      {/* TODO: Re-enable local workspaces when done cloud*/}
      <Private unauthenticated="login">
        <Set wrap={AppUnifiedLayout}>
          <Route path="/app" redirect={ROUTES.dashboard} />
          <Route path={ROUTES.dashboard} page={OverviewPage} name="dashboard" />
          <Route path={ROUTES.settingsWorkspace} page={GeneralSettingsPage} name="settingsWorkspace" />
          <Route path={ROUTES.settingsWorkspaceMembers} page={MembersSettingsPage} name="settingsWorkspaceMembers" />
          <Route path={ROUTES.settingsWorkspaceDangerZone} page={DangerZoneSettingsPage} name="settingsWorkspaceDangerZone" />
          <Route path={ROUTES.domains} page={DomainsPage} name="domains" />
          <Route path={ROUTES.collectionEditor} page={CollectionEditorPage} name="collectionEditor" />
        </Set>
      </Private>
      <Private unauthenticated="login">
        <Route path={ROUTES.admin} page={AdminPage} name="admin" />
      </Private>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
