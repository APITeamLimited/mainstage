import { ThemeOptions } from '@mui/material'

export const baseThemeOptions: ThemeOptions = {
  spacing: 6,
  typography: {
    // Old theme uses poppins, roboto maybe?
    // Reckon inter has an edge over the others
    fontFamily:
      'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    //fontFamily: 'Manrope, sans-serif',
    fontSize: 16,
    h1: {
      fontSize: '3.5rem',
      lineHeight: 3,
      fontWeight: 500,
    },
    h2: {
      fontSize: '2.625rem',
      lineHeight: 2.265,
      fontWeight: 500,
    },
    h3: {
      fontSize: `${28 / 16}rem`,
      lineHeight: 1.75,
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.125,
      fontWeight: 700,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.3125,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.3125,
      fontWeight: 300,
    },
    button: {
      fontSize: '0.875rem',
      lineHeight: 1,
      fontWeight: 500,
    },
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
      defaultProps: {
        animation: 'wave',
        variant: 'rounded',
        height: '100%',
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          borderRadius: '0.25rem',
        },
        sizeSmall: {
          height: '2rem',
        },
        sizeMedium: {
          height: '2.5rem',
        },
        sizeLarge: {
          height: '3rem',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          userSelect: 'none',
          //height: '1.5rem',
          //width: '1.5rem',
        },
      },
      defaultProps: {
        fontSize: 'small',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: '0.25rem',
          //height: '2rem',
          paddingX: '0.5rem',
          paddingY: '0.75rem',
          minHeight: '2rem',
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSwitch: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          transition: 'none',
        },
      },
    },
  },
}
