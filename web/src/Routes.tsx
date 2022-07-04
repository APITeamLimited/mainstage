// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set, Private } from '@redwoodjs/router'

import SplashLayout from './layouts/Splash'
import DashboardPage from './pages/app/DashboardPage'
import RootPage from './pages/splash/RootPage/RootPage'

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
      <Set prerender wrap={SplashLayout}>
        <Route path="/" page={RootPage} name="root" />
        <Route path="/platform/why-apiteam" page={NotFoundPage} name="whyAPITeam" />
        <Route path="/platform/pricing" page={NotFoundPage} name="pricing" />
        <Route path="/company/about" page={NotFoundPage} name="about" />
        <Route path="/legal/terms-of-service" page={NotFoundPage} name="termsOfService" />
        <Route path="/legal/privacy-policy" page={NotFoundPage} name="privacyPolicy" />
      </Set>
      <Private unauthenticated="login">
        <Route path="/app/dashboard" page={DashboardPage} name="dashboard" />
      </Private>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
