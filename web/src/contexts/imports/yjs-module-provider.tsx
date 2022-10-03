import { createContext, useContext, useEffect, useState } from 'react'

const importYJSModule = async () => {
  const yjsPromise = import('yjs')
  const awarenessProtocolPromise = import('y-protocols/awareness')

  const [yjs, awarenessProtocol] = await Promise.all([
    yjsPromise,
    awarenessProtocolPromise,
  ])

  return {
    ...yjs,
    awarenessProtocol,
  }
}

export type YJSModule = Awaited<ReturnType<typeof importYJSModule>>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const YJSModuleContext = createContext<YJSModule>(null)
export const useYJSModule = () => useContext(YJSModuleContext)

export const YJSModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [yjsModule, setYjsModule] = useState<YJSModule | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setYjsModule(await importYJSModule())
    }
    importModule()
  }, [])

  if (!yjsModule) {
    return <></>
  }

  return (
    <YJSModuleContext.Provider value={yjsModule}>
      {children}
    </YJSModuleContext.Provider>
  )
}
