import { createContext, useContext } from 'react'

import {
  BillingAddressQuery,
  BillingAddressQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

const BILLING_ADDRESS_QUERY = gql`
  query BillingAddressQuery($teamId: String) {
    customer(teamId: $teamId) {
      address {
        city
        country
        line1
        line2
        postal_code
        state
      }
    }
  }
`

const BillingAddressContext = createContext<null | {
  customerAddress: BillingAddressQuery['customer']['address'] | undefined
  refetchAddress: () => void
}>(null)

export const useBillingAddress = () => useContext(BillingAddressContext)

export const BillingAddressProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: customerAddressData, refetch: refetchAddress } = useQuery<
    BillingAddressQuery,
    BillingAddressQueryVariables
  >(BILLING_ADDRESS_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
  })

  const contextValue = customerAddressData
    ? { customerAddress: customerAddressData.customer.address, refetchAddress }
    : null

  return (
    <BillingAddressContext.Provider value={contextValue}>
      {children}
    </BillingAddressContext.Provider>
  )
}
