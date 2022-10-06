import { createContext, useContext, useEffect, useState } from 'react'

const importLib0Module = async () => {
  return await import('lib0')
}
export type Lib0Module = Awaited<ReturnType<typeof importLib0Module>>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Lib0ModuleContext = createContext<Lib0Module>(null)
export const useLib0Module = () => useContext(Lib0ModuleContext)

export const Lib0ModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [lib0Module, setLib0Module] = useState<Lib0Module | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setLib0Module(await importLib0Module())
    }
    importModule()
  }, [])

  if (!lib0Module) return <></>

  return (
    <Lib0ModuleContext.Provider value={lib0Module}>
      {children}
    </Lib0ModuleContext.Provider>
  )
}
