import { createContext, useContext, useEffect, useState } from 'react'

const importHotkeysModule = async () => await import('react-hotkeys-hook')
export type HotkeysModule = Awaited<ReturnType<typeof importHotkeysModule>>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const HotkeysModuleContext = createContext<HotkeysModule>(null)
export const useHotkeysModule = () => useContext(HotkeysModuleContext)

export const HotkeysModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [hotkeysModule, setHotkeysModule] = useState<HotkeysModule | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setHotkeysModule(await importHotkeysModule())
    }
    importModule()
  }, [])

  if (!hotkeysModule) return <></>

  return (
    <HotkeysModuleContext.Provider value={hotkeysModule}>
      {children}
    </HotkeysModuleContext.Provider>
  )
}
