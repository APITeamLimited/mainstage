import type { Direction, Theme } from '@mui/material'
import { responsiveFontSizes } from '@mui/material'
import { createTheme, ComponentsOverrides } from '@mui/material/styles'
import { string } from 'prop-types'

import { baseThemeOptions } from './base-theme-options'
import { darkThemeOptions } from './dark-theme-options'
import { lightThemeOptions } from './light-theme-options'

interface Neutral {
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

declare module '@mui/material/styles' {
  interface Palette {
    neutral?: Neutral
  }

  interface PaletteOptions {
    neutral?: Neutral
  }
}

export interface ThemeConfig {
  direction?: Direction
  responsiveFontSizes?: boolean
  mode: 'light' | 'dark'
}

type ThemeChoices = 'Default' | 'Devias' | 'Minimals'

export const theme: ThemeChoices = 'Default'

type CustomThemeType = Theme & {
  palette: {
    alternate: {
      main: string
      dark: string
    }
  }
}

export const getTheme = (config: ThemeConfig): CustomThemeType => {
  if (theme === 'Default') {
    return responsiveFontSizes(
      createTheme({
        ...baseThemeOptions,
        ...(config.mode === 'dark' ? darkThemeOptions : lightThemeOptions),
        direction: config.direction,
      })
    ) as unknown as CustomThemeType
  }
  throw new Error('Invalid theme')
}

export default getTheme
