import { AppLayoutBase } from './AppLayoutBase'
import { TopNav } from './components/TopNav'

export const AppCollectionLayout = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  return (
    <AppLayoutBase
      topNav={<TopNav />}
      footer={{
        element: <></>,
        height: 0,
      }}
      disableElevationTop={true}
      dividerOnTop={true}
    >
      {children}
    </AppLayoutBase>
  )
}
