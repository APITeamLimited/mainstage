import { TopNavBase } from 'src/layouts/TopNavBase'

type TopNavProps = {
  disableTop?: boolean
  topBarLeftZone?: React.ReactNode
}

export const TopNavLanding = ({
  disableTop = false,
  topBarLeftZone,
}: TopNavProps) => {
  return (
    <TopNavBase
      disableTop={disableTop}
      leftZone={topBarLeftZone}
      rightZone={
        <>
          {/*
          <TopNavLink name="Contact" path={routes.contact()} />
          <TopNavLink name="Docs" path={ROUTES.docs} />*/}
        </>
      }
    />
  )
}
