import { AppLayoutBase } from './AppLayoutBase'
import { TopNavApp } from './components/TopNavApp'

export const AppCollectionLayout = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  return <AppLayoutBase topNav={<TopNavApp />}>{children}</AppLayoutBase>
}
