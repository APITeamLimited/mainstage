import { ThemeOptions } from '@mui/material'

export const baseThemeOptions: ThemeOptions = {
  typography: {
    //fontFamily: '"Poppins", "sans-serif"',
  },

  components: {
    MuiFormLabel: {
      styleOverrides: {
        root: {
          userSelect: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          userSelect: 'none',
          transition: 'none',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
    /*MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
  // Set default border radius to 20px
  shape: {
    borderRadius: 20,
  */
  },
}
