import { AppLayoutBase } from './AppLayoutBase'
import { TopNavApp } from './components/TopNavApp'

export const AppUnifiedLayout = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  return <AppLayoutBase topNav={<TopNavApp />}>{children}</AppLayoutBase>
}
