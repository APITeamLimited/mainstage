import { AppBar, useTheme } from '@mui/material'

type CustomAppBarProps = {
  children?: React.ReactNode
  trigger: boolean
  disableTop?: boolean
}

export const nightAppBarColor = '#2E3441'

export const CustomAppBar = ({
  children,
  trigger,
  disableTop = false,
}: CustomAppBarProps) => {
  const theme = useTheme()

  return (
    <AppBar
      position="sticky"
      sx={{
        marginTop: '-1px',
        backgroundColor:
          disableTop && !trigger
            ? 'transparent'
            : theme.palette.background.paper,
        // Prevent app bar form changing color by applying desired linearGradien
        // all the time
        backgroundImage: disableTop
          ? undefined
          : !trigger
          ? 'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))'
          : undefined,

        // Disable shaddow on top of appbar
        clipPath: disableTop ? undefined : `inset(1 0px -20px 0px)`,
        borderBottom:
          !disableTop && !trigger
            ? `1px solid ${theme.palette.divider}`
            : undefined,
      }}
      elevation={trigger ? 8 : 0}
    >
      {children}
    </AppBar>
  )
}
