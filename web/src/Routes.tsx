import { Router, Route, Set, Private } from '@redwoodjs/router'

import { AppCollectionLayout } from './layouts/App'
import { AppDashboardLayout } from './layouts/App/AppDashboardLayout'
import { LandingLayoutSplash } from './layouts/Landing'
import { CollectionEditorPage } from './pages/app/CollectionEditorPage'
import { DomainsPage } from './pages/app/dashboard/DomainsPage'
import { OverviewPage } from './pages/app/dashboard/OverviewPage'
import { ProjectsPage } from './pages/app/dashboard/ProjectsPage'
import AboutPage from './pages/company/About/About'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicy/PrivacyPolicy'
import TermsOfServicePage from './pages/legal/TermsOfService/TermsOfService'
import PricingPage from './pages/platform/Pricing/Pricing'
import WhyAPITeamPage from './pages/platform/WhyAPITeam/WhyAPITeam'
import RootPage from './pages/splash/RootPage'

export const brandedRoutes = {
  platform: {
    name: 'Platform',
    subLinks: [
      {
        path: '/platform/why-apiteam',
        name: 'Why APITeam',
      },
      {
        path: '/platform/pricing',
        name: 'Pricing',
      },
    ],
  },
  company: {
    name: 'Company',
    subLinks: [
      {
        path: '/company/about',
        name: 'About',
      },
    ],
  },
  legal: {
    name: 'Legal',
    subLinks: [
      {
        path: '/legal/terms-of-service',
        name: 'Terms of Service',
      },
      {
        path: '/legal/privacy-policy',
        name: 'Privacy Policy',
      },
    ],
  },
}

const Routes = () => {
  return (
    <Router>
      <Route path="/login" page={LoginPage} name="login" />
      <Route path="/signup" page={SignupPage} name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
      <Set wrap={LandingLayoutSplash}>
        <Route path="/" page={RootPage} name="root" />
        <Route path="/platform/why-apiteam" page={WhyAPITeamPage} name="whyAPITeam" />
        <Route path="/platform/pricing" page={PricingPage} name="pricing" />
        <Route path="/company/about" page={AboutPage} name="about" />
        <Route path="/legal/terms-of-service" page={TermsOfServicePage} name="termsOfService" />
        <Route path="/legal/privacy-policy" page={PrivacyPolicyPage} name="privacyPolicy" />
      </Set>
      {/* TODO: Re-enable local workspaces when done cloud*/}
      <Private unauthenticated="login">
        <Set wrap={AppDashboardLayout}>
          <Route path="/app" redirect="/app/dashboard" />
          <Route path="/app/dashboard" page={OverviewPage} name="dashboard" />
          <Route path="/app/dashboard/projects" page={ProjectsPage} name="projects" />
          <Route path="/app/dashboard/domains" page={DomainsPage} name="domains" />
        </Set>
        <Set wrap={AppCollectionLayout}>
          <Route path="/app/collection" page={CollectionEditorPage} name="collectionEditor" />
        </Set>
      </Private>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
