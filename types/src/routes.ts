export const ROUTES = {
  splash: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  userUnsubscribe: '/user-unsubscribe',
  blanketUnsubscribe: '/blanket-unsubscribe',
  apiClient: '/platform/api-client',
  loadTesting: '/platform/load-testing',
  plansAndPricing: '/platform/plans-and-pricing',
  //aboutUs: '/about-us',
  contact: '/contact',
  termsOfService: '/legal/terms-of-service',
  privacyPolicy: '/legal/privacy-policy',
  cookiePolicy: '/legal/cookie-policy',
  //support: '/support',
  docs: '/docs',
  blog: '/blog',
  openSource: '/open-source',
  agent: '/agent',
  dashboard: '/app/dashboard',
  settingsWorkspace: '/app/dashboard/settings',
  settingsWorkspaceMembers: '/app/dashboard/settings/members',
  settingsWorkspaceDangerZone: '/app/dashboard/settings/danger-zone',
  settingsWorkspaceBilling: '/app/dashboard/settings/billing',
  settingsWorkspaceInvoices: '/app/dashboard/settings/invoices',
  domains: '/app/dashboard/domains',
  collectionEditor: '/app/collection',
  admin: '/admin',
  acceptInvitation: '/accept-invitation',
  declineInvitation: '/decline-invitation',
  verifyEmail: '/verify-email',
  deleteAccount: '/delete-account',
  deleteTeam: '/delete-team',
  changeOwner: '/change-owner',
} as const

export const LINKS = {
  gitHub: 'https://github.com/APITeamLimited',
  linkedIn: 'https://www.linkedin.com/company/apiteamlimited',
  globeTestRepo: 'https://github.com/APITeamLimited/globe-test',
  agentRepo: 'https://github.com/APITeamLimited/agent',
} as const

const agentVersion = 'v0.1.20'

export const AGENT_LINKS = {
  windows64: {
    link: `/api/public-downloads?filename=apiteam-agent-windows-amd64-${agentVersion}%2Emsi`,
    isFullLink: false,
  },
  macAMD64: {
    link: `/api/public-downloads?filename=apiteam-agent-darwin-amd64-${agentVersion}%2Epkg`,
    isFullLink: false,
  },
  macARM64: {
    link: `/api/public-downloads?filename=apiteam-agent-darwin-arm64-${agentVersion}%2Epkg`,
    isFullLink: false,
  },
  linux64Debian: {
    link: `/api/public-downloads?filename=apiteam-agent-linux-amd64-${agentVersion}%2Edeb`,
    isFullLink: false,
  },
  linux64Binary: {
    link: `/api/public-downloads?filename=apiteam-agent-linux-amd64-${agentVersion}%2Etar%2Egz`,
    isFullLink: false,
  },
} as const
