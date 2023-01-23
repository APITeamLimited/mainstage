import React from 'react'

type APITeamLogoProps = {
  style?: React.SVGAttributes<SVGSVGElement>['style']
}

export const APITeamLogo = ({ style }: APITeamLogoProps) => (
  <picture>
    <source
      srcSet="https://apiteam.cloud/img/logo-large-light-1920.png"
      media="(prefers-color-scheme: light)"
    />
    <source
      srcSet="https://apiteam.cloud/img/logo-large-dark-1920.png"
      media="(prefers-color-scheme: dark)"
    />
    <img
      src="https://apiteam.cloud/img/logo-large-light-1920.png"
      alt="APITeam Logo"
      style={{ height: '32px', ...style }}
    />
  </picture>
)
