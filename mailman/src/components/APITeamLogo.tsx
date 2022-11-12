import React from 'react'

import { checkValue } from '../config'

type APITeamLogoProps = {
  style?: React.SVGAttributes<SVGSVGElement>['style']
}

export const APITeamLogo = ({ style }: APITeamLogoProps) => (
  <img
    src={`${checkValue<string>('gateway.url')}/img/logo-large-light-1920.png`}
    style={{ height: '32px', ...style }}
    alt="APITeam Logo"
  />
)
