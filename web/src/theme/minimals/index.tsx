import { useMemo, ReactNode } from 'react'

// @mui
import { CssBaseline } from '@mui/material'
import {
  createTheme,
  ThemeOptions,
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
  Theme,
} from '@mui/material/styles'

// hooks

//
import { ThemeConfig } from '..'

import breakpoints from './breakpoints'
import componentsOverride from './overrides'
import palette from './palette'
import shadows, { customShadows } from './shadows'
import typography from './typography'

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode
}

export default function getTheme(config: ThemeConfig): Theme {
  const isLight = config.mode === 'light'

  const themeOptions: ThemeOptions = {
    palette: isLight ? palette.light : palette.dark,
    typography,
    breakpoints,
    shape: { borderRadius: 8 },
    direction: 'ltr',
    shadows: isLight ? shadows.light : shadows.dark,
    customShadows: isLight ? customShadows.light : customShadows.dark,
  }

  const theme = createTheme(themeOptions)
  theme.components = componentsOverride(theme)
  return theme
}
