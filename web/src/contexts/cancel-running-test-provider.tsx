import { useMutation } from "@redwoodjs/web"
import { createContext, useContext } from "react"
import { snackSuccessMessageVar } from "src/components/app/dialogs"
import type {
  CancelResponseTestMutation,
  CancelResponseTestMutationVariables,
} from "types/graphql"

const CANCEL_RESPONSE_TEST_MUTATION = gql`
  mutation CancelResponseTestMutation($teamId: String, $jobId: String!) {
    cancelRunningTest(teamId: $teamId, jobId: $jobId)
  }
`

const UseTestCancelContext = createContext<((teamId: string | null, jobId: string) => void) | null>(
  null
)

export const useTestCancel = () => useContext(UseTestCancelContext)

type CancelRunningTestProviderProps = {
  children: React.ReactNode
}

export const CancelRunningTestProvider = ({
  children,
}: CancelRunningTestProviderProps) => {
  const [cancelRunningTest] = useMutation<
    CancelResponseTestMutation,
    CancelResponseTestMutationVariables
  >(CANCEL_RESPONSE_TEST_MUTATION, {
    onCompleted: () => snackSuccessMessageVar('Stopping test run'),
  })

  return <UseTestCancelContext.Provider value={(teamId: string | null, jobId: string) => cancelRunningTest({
    variables: {
      teamId,
      jobId,
    },
  })}>{children}</UseTestCancelContext.Provider>
}