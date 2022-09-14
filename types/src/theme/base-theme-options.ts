import { ThemeOptions } from '@mui/material'

export const baseThemeOptions: ThemeOptions = {
  components: {
    MuiFormLabel: {
      styleOverrides: {
        root: {
          userSelect: 'none',
        },
      },
    },
  },
}
