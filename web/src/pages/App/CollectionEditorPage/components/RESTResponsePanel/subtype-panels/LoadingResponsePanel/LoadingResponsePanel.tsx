/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import type { Map as YMap } from 'yjs'

import { useYMap } from 'src/lib/zustand-yjs'

import { LoadingMultipleResponsePanel } from './LoadingMultipleResponsePanel'
import { LoadingSingleResponsePanel } from './LoadingSingleResponsePanel'

type LoadingResponsePanelProps = {
  focusedResponse: YMap<any>
}

export const LoadingResponsePanel = ({
  focusedResponse,
}: LoadingResponsePanelProps) => {
  const responseHook = useYMap(focusedResponse)

  const executionMode = useMemo(
    () =>
      (focusedResponse?.get('options')?.executionMode ?? null) as
        | 'httpMultiple'
        | 'httpSingle'
        | null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responseHook]
  )

  return executionMode === 'httpMultiple' ? (
    <LoadingMultipleResponsePanel focusedResponse={focusedResponse} />
  ) : (
    <LoadingSingleResponsePanel focusedResponse={focusedResponse} />
  )
}
