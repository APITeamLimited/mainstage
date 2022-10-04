import { useEffect, useMemo } from 'react'

import shallow from 'zustand/shallow'

import type { YJSModule } from 'src/contexts/imports'

import { MountFunction, YDocEnum } from './types'
import useYStore from './useYStore'

const useYDoc = (name: string, mount: MountFunction, Y: YJSModule) => {
  const [mountYDoc, unMountYDoc, yDocs] = useYStore(
    (state) => [state.mountYDoc, state.unMountYDoc, state.yDocs],
    shallow
  )
  const yDoc = useMemo(() => {
    const match = yDocs.find(([docGuid]) => docGuid === name)
    if (match) return match[YDocEnum.DOC]
    const yDoc = new Y.Doc()
    yDoc.guid = name
    mountYDoc(yDoc, mount)
    return yDoc
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yDocs, name])

  useEffect(() => {
    return () => unMountYDoc(yDoc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unMountYDoc, name])
  return yDoc
}

export default useYDoc
