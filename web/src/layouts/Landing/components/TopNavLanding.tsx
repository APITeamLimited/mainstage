import React from 'react'

import { TopNavBase } from 'src/layouts/TopNavBase'

type TopNavProps = {
  disableTop?: boolean
}

export const TopNavLanding = ({ disableTop = false }: TopNavProps) => {
  return <TopNavBase disableTop={disableTop} />
}
