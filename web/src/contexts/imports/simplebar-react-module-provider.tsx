import { createContext, useContext, useEffect, useState } from 'react'

const importSimplebarReactModule = async () => {
  return await import('simplebar-react')
}
export type SimplebarReactModule = Awaited<
  ReturnType<typeof importSimplebarReactModule>
>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SimplebarReactModuleContext = createContext<SimplebarReactModule>(null)
export const useSimplebarReactModule = () =>
  useContext(SimplebarReactModuleContext)

export const SimplebarReactModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [simplebarReactModule, setSimplebarReactModule] =
    useState<SimplebarReactModule | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setSimplebarReactModule(await importSimplebarReactModule())
    }
    importModule()
  }, [])

  if (!simplebarReactModule) return <></>

  return (
    <SimplebarReactModuleContext.Provider value={simplebarReactModule}>
      {children}
    </SimplebarReactModuleContext.Provider>
  )
}
