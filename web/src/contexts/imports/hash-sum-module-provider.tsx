import { createContext, useContext, useEffect, useState } from 'react'

const importHashSumModule = async () => {
  return await import('hash-sum')
}
export type HashSumModule = Awaited<ReturnType<typeof importHashSumModule>>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const HashSumModuleContext = createContext<HashSumModule>(null)
export const useHashSumModule = () => useContext(HashSumModuleContext)

export const HashSumModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [hashSumModule, setHashSumModule] = useState<HashSumModule | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setHashSumModule(await importHashSumModule())
    }
    importModule()
  }, [])

  if (!hashSumModule) return <></>

  return (
    <HashSumModuleContext.Provider value={hashSumModule}>
      {children}
    </HashSumModuleContext.Provider>
  )
}
