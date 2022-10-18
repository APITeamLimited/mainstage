import type { Doc as YDoc } from 'yjs'

import useYObserve from './useYObserve'

const useYDoc = (yDoc: YDoc) => {
  useYObserve<YDoc>(yDoc, () => yDoc.toJSON())
  //const dataSet = useYStore((state) => state.data)

  //const data = useMemo(() => {
  //  const match = dataSet.find(([type]) => type === yDoc)
  //  if (!match) return {}
  //  return match[1]
  //}, [yDoc, dataSet])
  //
  //const noBinding = (funcKey: keyof YDoc) => () => {
  //  throw new Error(`Y.Map#${funcKey.toString()} is not implemented`)
  //}

  return
}

export default useYDoc
