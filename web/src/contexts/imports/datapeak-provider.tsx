import { createContext, useContext, useEffect, useState } from 'react'

const importDatapeakModule = async () => await import('@apiteam/datapeak')
export type DatapeakModule = Awaited<ReturnType<typeof importDatapeakModule>>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DatapeakModuleContext = createContext<DatapeakModule>(null)
export const useDatapeakModule = () => useContext(DatapeakModuleContext)

export const DatapeakModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [dndModule, setDatapeakModule] = useState<DatapeakModule | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setDatapeakModule(await importDatapeakModule())
    }
    importModule()
  }, [])

  if (!dndModule) return <></>

  return (
    <DatapeakModuleContext.Provider value={dndModule}>
      {children}
    </DatapeakModuleContext.Provider>
  )
}
