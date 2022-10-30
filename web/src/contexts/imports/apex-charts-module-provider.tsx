import { createContext, useContext, useEffect, useState } from 'react'

const importApexChartsModule = async () => await import('react-apexcharts')
export type ApexChartsModule = Awaited<
  ReturnType<typeof importApexChartsModule>
>

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ApexChartsModuleContext = createContext<ApexChartsModule>(null)
export const useApexChartsModule = () => useContext(ApexChartsModuleContext)

export const ApexChartsModuleProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [apexChartsModule, setApexChartsModule] =
    useState<ApexChartsModule | null>(null)

  useEffect(() => {
    const importModule = async () => {
      setApexChartsModule(await importApexChartsModule())
    }
    importModule()
  }, [])

  if (!apexChartsModule) return <></>

  return (
    <ApexChartsModuleContext.Provider value={apexChartsModule}>
      {children}
    </ApexChartsModuleContext.Provider>
  )
}
