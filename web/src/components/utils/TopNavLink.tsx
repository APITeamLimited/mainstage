import { useTheme, Typography } from '@mui/material'

import { Link } from '@redwoodjs/router'

type TopNavLinkProps = {
  name: string
  path: string
}

export const TopNavLink = ({ name, path }: TopNavLinkProps) => {
  const theme = useTheme()

  return (
    <Typography>
      <Link
        to={path}
        style={{
          textDecoration: 'none',
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[300]
              : theme.palette.grey[800],
        }}
      >
        {name}
      </Link>
    </Typography>
  )
}
