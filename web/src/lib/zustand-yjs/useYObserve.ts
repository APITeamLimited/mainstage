/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'

import type { AbstractType } from 'yjs'
import shallow from 'zustand/shallow'

import useYStore from './useYStore'

const useYObserve = <T extends AbstractType<any>>(
  yType: T,
  serialize: () => any
): void => {
  const [listen, unListen, update] = useYStore(
    (state) => [state.listenType, state.unListenType, state.update],
    shallow
  )

  useEffect(() => {
    listen(yType, () => update(yType, serialize()))
    update(yType, serialize())
    return () => unListen(yType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useYObserve
