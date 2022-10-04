import { Box } from '@mui/material'

import { TopNavBase } from 'src/layouts/TopNavBase'

type TopNavProps = {
  disableTop?: boolean
}

export const TopNavLanding = ({ disableTop = false }: TopNavProps) => {
  return (
    <TopNavBase
      disableTop={disableTop}
      rightZone={
        <>
          {/*
          <TopNavLink name="Contact" path={routes.contact()} />
          <TopNavLink name="Docs" path={routes.docs()} />*/}
        </>
      }
    />
  )
}
