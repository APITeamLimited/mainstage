// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set } from '@redwoodjs/router'

import { AppLayout } from './layouts/App'
import { LandingLayoutSplash } from './layouts/Landing/LandingLayoutSplash'
import { CollectionEditorPage } from './pages/app/CollectionEditorPage'
import DashboardPage from './pages/app/DashboardPage'
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
      <Set wrap={AppLayout}>
        <Route path="/app" redirect="/app/dashboard" />
        <Route path="/app/dashboard" page={DashboardPage} name="dashboard" />

        <Route path="/app/collection" page={CollectionEditorPage} name="collectionEditor" />
      </Set>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
