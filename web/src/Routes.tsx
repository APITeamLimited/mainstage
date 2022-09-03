import { Router, Route, Set, Private } from '@redwoodjs/router'

import { AppUnifiedLayout } from './layouts/App'
import { LandingLayoutSplash, LandingLayoutContained } from './layouts/Landing'
import { CollectionEditorPage } from './pages/app/CollectionEditorPage'
import { DomainsPage } from './pages/app/dashboard/DomainsPage'
import { OverviewPage } from './pages/app/dashboard/OverviewPage'
import GeneralSettingsPage from './pages/app/dashboard/SettingsPages/GeneralSettingsPage/GeneralSettingsPage'
import { MembersSettingsPage } from './pages/app/dashboard/SettingsPages/MembersSettingsPage/MembersSettingsPage'
import AboutPage from './pages/company/AboutPage/AboutPage'
import ContactPage from './pages/company/ContactPage/ContactPage'
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
      <Route path="/login" page={LoginPage} name="login" />
      <Route path="/signup" page={SignupPage} name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
      <Set wrap={LandingLayoutSplash}>
        <Route path="/" page={RootPage} name="splash" />
      </Set>
      <Set wrap={LandingLayoutContained}>
        <Route path="/platform/why-apiteam" page={WhyAPITeamPage} name="whyAPITeam" />
        <Route path="/platform/pricing" page={PricingPage} name="pricing" />
        <Route path="/company/about" page={AboutPage} name="about" />
        <Route path="/contact" page={ContactPage} name="contact" />
        <Route path="/legal/terms-of-service" page={TermsOfServicePage} name="termsOfService" />
        <Route path="/legal/privacy-policy" page={PrivacyPolicyPage} name="privacyPolicy" />
        <Route path="/legal/cookie-policy" page={CookiePolicyPage} name="cookiePolicy" />
        <Route path="/support" page={PrivacyPolicyPage} name="supportCenter" />
        <Route path="/docs" page={PrivacyPolicyPage} name="docs" />
        <Route path="/docs" page={PrivacyPolicyPage} name="blog" />
      </Set>
      {/* TODO: Re-enable local workspaces when done cloud*/}
      <Private unauthenticated="login">
        <Set wrap={AppUnifiedLayout}>
          <Route path="/app" redirect="/app/dashboard" />
          <Route path="/app/dashboard" page={OverviewPage} name="dashboard" />
          <Route path="/app/dashboard/settings" page={GeneralSettingsPage} name="settingsWorkspace" />
          <Route path="/app/dashboard/settings/members" page={MembersSettingsPage} name="settingsWorkspaceMembers" />
          <Route path="/app/dashboard/domains" page={DomainsPage} name="domains" />
          <Route path="/app/collection" page={CollectionEditorPage} name="collectionEditor" />
        </Set>
      </Private>
      <Private unauthenticated="login">
        <Route path="/admin" page={AdminPage} name="admin" />
      </Private>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
