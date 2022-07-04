import React from 'react'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import ThemeModeToggler from 'src/components/ThemeModeToggler'

interface Props {
  colorInvert?: boolean
}

const TopNav = ({ colorInvert = false }: Props): JSX.Element => {
  return (
    <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
      <Box marginRight={{ xs: 1, sm: 2 }}>
        <Link
          underline="none"
          component="a"
          href="/blocks"
          color={colorInvert ? 'common.white' : 'text.primary'}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Support
        </Link>
      </Box>
      <Box marginRight={{ xs: 1, sm: 2 }}>
        <Link
          underline="none"
          component="a"
          href="/docs/introduction"
          color={colorInvert ? 'common.white' : 'text.primary'}
        >
          Login
        </Link>
      </Box>
      <Box>
        <ThemeModeToggler />
      </Box>
    </Box>
  )
}

export default TopNav
