import { Typography, useTheme } from '@mui/material'

type TopBarPageNameProps = {
  name: string
}

export const TopBarPageName = ({ name }: TopBarPageNameProps) => {
  const theme = useTheme()

  return (
    <Typography
      variant="h6"
      sx={{
        userSelect: 'none',
      }}
      color={theme.palette.text.primary}
      fontWeight="bold"
    >
      {name}
    </Typography>
  )
}
