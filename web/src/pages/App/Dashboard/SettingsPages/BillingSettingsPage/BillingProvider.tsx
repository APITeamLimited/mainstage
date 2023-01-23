import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { loadStripe, SetupIntent, Stripe } from '@stripe/stripe-js'
import {
  BillingAddressQuery,
  BillingAddressQueryVariables,
  PaymentMethodsQuery,
  PaymentMethodsQueryVariables,
  SetupIntentsQuery,
  SetupIntentsQueryVariables,
  SubscriptionQuery,
  SubscriptionQueryVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { STRIPE_PUBLISHABLE_KEY } from './stripe'

const BILLING_ADDRESS_QUERY = gql`
  query BillingAddressQuery($teamId: String) {
    customer(teamId: $teamId) {
      id
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

const SETUP_INTENTS_QUERY = gql`
  query SetupIntentsQuery($teamId: String) {
    setupIntents(teamId: $teamId) {
      id
      client_secret
      status
    }
  }
`

const PAYMENT_METHODS_QUERY = gql`
  query PaymentMethodsQuery($teamId: String) {
    paymentMethods(teamId: $teamId) {
      id
      card {
        brand
        country
        exp_month
        exp_year
        last4
      }
    }
    customer(teamId: $teamId) {
      id
      invoice_settings {
        default_payment_method
      }
    }
  }
`

const SUBSCRIPTION_QUERY = gql`
  query SubscriptionQuery($teamId: String) {
    subscription(teamId: $teamId) {
      id
      cancel_at_period_end
      current_period_end
    }
  }
`

const BillingAddressContext = createContext<null | {
  customerAddress: BillingAddressQuery['customer']['address'] | undefined
  refetchAddress: () => void
}>(null)

export const useBillingAddress = () => useContext(BillingAddressContext)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const PaymentMethodsContext =
  createContext<ReturnType<typeof usePaymentMethodsValue>>(null)
export const usePaymentMethods = () => useContext(PaymentMethodsContext)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SetupIntentsContext =
  createContext<ReturnType<typeof useSetupIntentsValue>>(null)
export const useSetupIntents = () => useContext(SetupIntentsContext)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SubscriptionContext =
  createContext<ReturnType<typeof useSubscriptionValue>>(null)
export const useSubscription = () => useContext(SubscriptionContext)

export const BillingProvider = ({
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

  const billingAddress = useMemo(
    () =>
      customerAddressData
        ? {
            customerAddress: customerAddressData.customer.address,
            refetchAddress,
          }
        : null,
    [customerAddressData, refetchAddress]
  )

  const paymentMethods = usePaymentMethodsValue()
  const setupIntents = useSetupIntentsValue()
  const subscription = useSubscriptionValue()

  return (
    <BillingAddressContext.Provider value={billingAddress}>
      <PaymentMethodsContext.Provider value={paymentMethods}>
        <SetupIntentsContext.Provider value={setupIntents}>
          <SubscriptionContext.Provider value={subscription}>
            {children}
          </SubscriptionContext.Provider>
        </SetupIntentsContext.Provider>
      </PaymentMethodsContext.Provider>
    </BillingAddressContext.Provider>
  )
}

const usePaymentMethodsValue = () => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: paymentMethodsData, refetch: refetchPaymentMethods } = useQuery<
    PaymentMethodsQuery,
    PaymentMethodsQueryVariables
  >(PAYMENT_METHODS_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    onError: (error) => {
      snackErrorMessageVar(
        `Failed to fetch payment data (payment methods): ${error}`
      )
    },
  })

  return {
    fetchedPaymentMethods: paymentMethodsData?.paymentMethods ?? [],
    customer: paymentMethodsData?.customer,
    refetchPaymentMethods,
    paymentMethodsLoaded: !!paymentMethodsData,
  }
}

const useSetupIntentsValue = () => {
  const [stripe, setStripe] = useState<Stripe | null>(null)

  useEffect(() => {
    const loadStripePromise = async () => {
      setStripe(await loadStripe(STRIPE_PUBLISHABLE_KEY))
    }

    loadStripePromise()
  }, [])

  const workspaceInfo = useWorkspaceInfo()

  const { data: setupIntentsData, refetch: refetchSetupIntents } = useQuery<
    SetupIntentsQuery,
    SetupIntentsQueryVariables
  >(SETUP_INTENTS_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    onError: (error) => {
      snackErrorMessageVar(
        `Failed to fetch payment data (setup intents): ${error}`
      )
    },
  })

  const [fetchedSetupIntents, setFetchedSetupIntents] = useState<SetupIntent[]>(
    []
  )

  useEffect(() => {
    if (!stripe || !setupIntentsData) return

    const setupIntents = setupIntentsData.setupIntents

    if (setupIntents.length === 0) {
      setFetchedSetupIntents([])
    }

    const handleFetchSetupIntents = async (
      setupIntents: SetupIntentsQuery['setupIntents']
    ) => {
      const secrets = setupIntents
        .map((setupIntent) => setupIntent.client_secret)
        .filter((secret) => secret !== null) as string[]

      const setupIntentResults = await Promise.all(
        secrets.map((secret) => stripe.retrieveSetupIntent(secret))
      )

      const fetchedSetupIntents = [] as SetupIntent[]

      setupIntentResults.forEach((setupIntent) => {
        if (setupIntent.error) {
          throw setupIntent.error
        }

        fetchedSetupIntents.push(setupIntent.setupIntent)
      })

      return fetchedSetupIntents
    }

    handleFetchSetupIntents(setupIntents)
      .catch((err) => {
        snackErrorMessageVar(
          `Failed to fetch payment data (setup intents): ${err}`
        )
        return []
      })
      .then((fetchedSetupIntents) => {
        setFetchedSetupIntents(fetchedSetupIntents)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupIntentsData, stripe])

  return {
    fetchedSetupIntents,
    refetchSetupIntents,
    setupIntentsLoaded: !!setupIntentsData,
  }
}

const useSubscriptionValue = () => {
  const workspaceInfo = useWorkspaceInfo()

  const { data: subscriptionData, refetch: refetchSubscription } = useQuery<
    SubscriptionQuery,
    SubscriptionQueryVariables
  >(SUBSCRIPTION_QUERY, {
    variables: {
      teamId: workspaceInfo.isTeam ? workspaceInfo.scope.variantTargetId : null,
    },
    onError: (error) => {
      snackErrorMessageVar(
        `Failed to fetch payment data (subscription): ${error}`
      )
    },
  })

  return {
    fetchedSubscription: subscriptionData?.subscription,
    refetchSubscription,
    subscriptionLoaded: !!subscriptionData,
  }
}
