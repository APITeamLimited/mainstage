import { createContext, useContext } from 'react'

import type {
  CancelResponseTestMutation,
  CancelResponseTestMutationVariables,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { useLocalTestManager } from 'src/test-manager/executors'
const CANCEL_RESPONSE_TEST_MUTATION = gql`
  mutation CancelResponseTestMutation($teamId: String, $jobId: String!) {
    cancelRunningTest(teamId: $teamId, jobId: $jobId)
  }
`

const UseTestCancelContext = createContext<
  | ((
      teamId: string | null,
      jobId: string,
      executionAgent: 'Cloud' | 'Local',
      localJobId?: string
    ) => void)
  | null
>(null)

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

  const localManager = useLocalTestManager()

  const cancelFunc = (
    teamId: string | null,
    jobId: string,
    executionAgent: 'Cloud' | 'Local',
    localJobId?: string
  ) => {
    if (executionAgent === 'Cloud') {
      cancelRunningTest({
        variables: {
          teamId,
          jobId,
        },
      })
    } else if (executionAgent === 'Local') {
      if (!localJobId) {
        throw new Error(
          `Can't cancel test run. Unknown localJobId for jobId ${jobId}`
        )
      }
      localManager?.abortJob(localJobId)
    } else {
      throw new Error(
        `Can't cancel test run. Unknown execution agent ${executionAgent}`
      )
    }
  }

  return (
    <UseTestCancelContext.Provider value={cancelFunc}>
      {children}
    </UseTestCancelContext.Provider>
  )
}
