/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from 'react'

import type { Doc as YDoc } from 'yjs'

import { AwarenessData, AwarenessSetData } from './types'
import useYStore from './useYStore'

const useYAwareness = <T extends Record<string, unknown>>(
  yDoc: YDoc
): [AwarenessData<T>, AwarenessSetData<T>] => {
  const matches = useYStore(
    useCallback(
      (state) => state.yAwareness.filter(([guid]) => guid === yDoc.guid),
      [yDoc.guid]
    )
  )
  const [awarenessData, awareness] = useMemo<[T[], any]>(() => {
    if (matches.length === 0)
      return [
        [],
        {
          error:
            'Awareness not registered. Use startAwareness method from your YDoc connect function.',
        },
      ]
    const [_docGuid, awareness, changes] = matches[0]
    return [changes as T[], awareness]
  }, [matches])
  const awarenessSetData = useCallback(
    (newState: Partial<T>) => {
      if (awareness.error) {
        console.error(awareness.error)
      } else {
        const previousState = awareness.getLocalState() as T
        awareness.setLocalState({ ...previousState, ...newState })
      }
    },
    [awareness]
  )
  return [awarenessData, awarenessSetData]
}

export default useYAwareness
