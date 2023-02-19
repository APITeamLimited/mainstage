const agentVersion = 'v0.2.7'

// Mac ARM64 is not supported yet

export const AGENT_FILENAMES = {
  windows64: `apiteam-agent-windows-amd64-${agentVersion}.msi`,
  macAMD64: `apiteam-agent-darwin-amd64-${agentVersion}.pkg`,
  //macARM64: `apiteam-agent-darwin-arm64-${agentVersion}.pkg`,
  linux64Debian: `apiteam-agent-linux-amd64-${agentVersion}.deb`,
  linux64Binary: `apiteam-agent-linux-amd64-${agentVersion}.tar.gz`,
} as const

export const AGENT_LINKS = {
  windows64: {
    link: `/api/public-downloads?filename=apiteam-agent-windows-amd64-${agentVersion}%2Emsi`,
    isFullLink: false,
  },
  macAMD64: {
    link: `/api/public-downloads?filename=apiteam-agent-darwin-amd64-${agentVersion}%2Epkg`,
    isFullLink: false,
  },
  //macARM64: {
  //  link: `/api/public-downloads?filename=apiteam-agent-darwin-arm64-${agentVersion}%2Epkg`,
  //  isFullLink: false,
  //},
  linux64Debian: {
    link: `/api/public-downloads?filename=apiteam-agent-linux-amd64-${agentVersion}%2Edeb`,
    isFullLink: false,
  },
  linux64Binary: {
    link: `/api/public-downloads?filename=apiteam-agent-linux-amd64-${agentVersion}%2Etar%2Egz`,
    isFullLink: false,
  },
} as const
