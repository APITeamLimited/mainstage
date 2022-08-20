import { AppBar, Divider, useTheme } from '@mui/material'

type CustomAppBarProps = {
  appBar?: React.ReactNode
  trigger: boolean
  dividerOnTop?: boolean
  disableElevationTop?: boolean
}

export const CustomAppBar = ({
  appBar,
  trigger,
  dividerOnTop,
  disableElevationTop,
}: CustomAppBarProps) => {
  const theme = useTheme()

  return (
    <AppBar
      position={'sticky'}
      sx={{
        top: 0,
        backgroundColor: theme.palette.background.paper,
        // Prevent app bar form changing color by applying desired linearGradien
        // all the time
        backgroundImage:
          'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',
        // Disable shaddow on top of appbar
        clipPath: `inset(1 0px -20px 0px)`,
      }}
      elevation={trigger ? 8 : disableElevationTop ? 0 : 8}
    >
      {appBar}
      {dividerOnTop && !trigger && <Divider />}
    </AppBar>
  )
}
