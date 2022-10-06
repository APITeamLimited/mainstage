import { useState, useEffect } from 'react'
import type {Props as ApexChartProps} from 'react-apexcharts'

const importApexChartsModule = async () => import('react-apexcharts')
export type ApexChartsModule = Awaited<ReturnType<typeof importApexChartsModule>>

export const DynamicImportChart = (props: ApexChartProps) => {
  const [apexChartsModule, setApexChartsModule] = useState<ApexChartsModule | null>(null)

  useEffect(() => {
    importApexChartsModule().then(setApexChartsModule)
  }, [])

  if (!ApexCharts) {
    return <></>
  }

  // @ts-ignore
  return <apexChartsModule.default {...props} />
}