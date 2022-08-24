import { AppBar, Divider, useTheme } from '@mui/material'

type CustomAppBarProps = {
  children?: React.ReactNode
  trigger: boolean
  disableTop?: boolean
}

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
        top: 0,
        backgroundColor: theme.palette.background.paper,
        // Prevent app bar form changing color by applying desired linearGradien
        // all the time
        backgroundImage: disableTop
          ? undefined
          : 'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',

        // Disable shaddow on top of appbar
        clipPath: disableTop ? undefined : `inset(1 0px -20px 0px)`,
      }}
      elevation={trigger ? 8 : 0}
    >
      {children}
      {!disableTop && !trigger && <Divider />}
    </AppBar>
  )
}
