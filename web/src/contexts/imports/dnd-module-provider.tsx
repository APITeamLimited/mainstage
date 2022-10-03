import { createContext, useContext, useEffect, useState } from 'react'

const importDnDModule = async () => await import('src/components/dnd')
export type DnDModule = Awaited<ReturnType<typeof importDnDModule>>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DnDModuleContext = createContext<DnDModule>(null)
export const useDnDModule = () => useContext(DnDModuleContext)

export const DnDModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [dndModule, setDnDModule] = useState<DnDModule | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setDnDModule(await importDnDModule())
    }
    importModule()
  }, [])

  if (!dndModule) return <></>

  return (
    <DnDModuleContext.Provider value={dndModule}>
      {children}
    </DnDModuleContext.Provider>
  )
}
