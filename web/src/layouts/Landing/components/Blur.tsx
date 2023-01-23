import { alpha, useTheme } from '@mui/material'

export const Blur = () => {
  const theme = useTheme()

  // const blurredTheme = useMemo(
  //   () => ({
  //     ...theme,
  //     palette: {
  //       ...theme.palette,
  //       background: `radial-gradient(circle at 50% 50%,${alpha(
  //         theme.palette.primary.main,
  //         0.1
  //       )}, ${alpha(theme.palette.primary.light, 0.0)})`,
  //     },
  //   }),
  //   [theme]
  // )

  return (
    <div
      style={{
        zIndex: 1,
        top: 0,

        position: 'fixed',
        width: '100vw',
        height: '100vh',
        background: `radial-gradient(circle at 50% 50%,${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.background.paper, 0.0)})`,
      }}
    />
  )
}
