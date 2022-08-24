import { AppLayoutBase } from './AppLayoutBase'
import { TopNavApp } from './components/TopNavApp'

export const AppCollectionLayout = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  return (
    <AppLayoutBase
      topNav={<TopNavApp />}
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
