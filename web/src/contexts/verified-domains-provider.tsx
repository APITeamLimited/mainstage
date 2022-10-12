import { useMemo, createContext, useContext } from 'react'

import { AppVerifiedDomains, AppVerifiedDomainsVariables } from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

const AppVerifiedDomainsContext = createContext<
  AppVerifiedDomains['verifiedDomains']
>([])
export const useVerifiedDomains = () => useContext(AppVerifiedDomainsContext)

const APP_VERIFIED_DOMAINS_QUERY = gql`
  query AppVerifiedDomains($teamId: String) {
    verifiedDomains(teamId: $teamId) {
      id
      domain
      variant
      variantTargetId
      verified
    }
  }
`

type VerifiedDomainsProviderProps = {
  children?: React.ReactNode
}

export const VerifiedDomainsProvider = ({
  children,
}: VerifiedDomainsProviderProps) => {
  const workspace = useWorkspaceInfo()
  const { data: verifiedDomainsData } = useQuery<
    AppVerifiedDomains,
    AppVerifiedDomainsVariables
  >(APP_VERIFIED_DOMAINS_QUERY, {
    variables: {
      teamId:
        workspace?.scope.variant === 'TEAM'
          ? workspace?.scope.variantTargetId
          : null,
    },
    pollInterval: 5000,
  })

  const verifiedDomains = useMemo(
    () =>
      (verifiedDomainsData?.verifiedDomains ?? []).filter(
        (domain) => domain.verified
      ),
    [verifiedDomainsData]
  )

  return (
    <AppVerifiedDomainsContext.Provider value={verifiedDomains}>
      {children}
    </AppVerifiedDomainsContext.Provider>
  )
}
