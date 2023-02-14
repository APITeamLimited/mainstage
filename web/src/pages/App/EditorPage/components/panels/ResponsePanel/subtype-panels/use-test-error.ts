import { useMemo } from 'react'

import { GlobeTestMessage, MapWrapper } from '@apiteam/types/src'
import type { Map as YMap } from 'yjs'

export const useTestError = (
  focusedResponse: YMap<any>,
  focusedResponseHook: MapWrapper<any, any>,
  storedGlobeTestLogs: GlobeTestMessage[] | null
) => {
  const errorMessage = useMemo(() => {
    if (!focusedResponse.get('abortedEarly')) {
      return null
    }

    if (!storedGlobeTestLogs) {
      return 'Test aborted early due to error, an unknown error occurred.'
    }

    // Find last message with messageType ERROR and find most recent
    const sortedErrors = storedGlobeTestLogs
      .filter((message) => message.messageType === 'ERROR')
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    if (
      sortedErrors.length === 0 ||
      typeof sortedErrors[0].message !== 'string'
    ) {
      return 'Test aborted early due to error, an unknown error occurred.'
    }

    if (sortedErrors[0].message.length > 200) {
      return `Test aborted early due to error: ${sortedErrors[0].message.slice(
        0,
        200
      )}... Message truncated, an unknown error occurred.`
    }

    if (sortedErrors[0].message === 'job cancelled by user') {
      return `Load test aborted early, job cancelled by user.`
    }

    return `Test aborted early due to error: ${
      sortedErrors[0].message as string
    }`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponseHook, storedGlobeTestLogs])

  return errorMessage
}
