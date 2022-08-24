import { useTheme } from '@mui/material'

export const SlashDivider = () => {
  const theme = useTheme()

  return (
    <span
      style={{
        fontSize: 30,
        color: theme.palette.text.secondary,
        fontWeight: 'lighter',
        opacity: 0.2,
        cursor: 'default',
        userSelect: 'none',
        rotate: '10deg',
      }}
    >
      /
    </span>
  )
}
