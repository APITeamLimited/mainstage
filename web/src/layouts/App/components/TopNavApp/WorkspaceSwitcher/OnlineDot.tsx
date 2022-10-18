import { SvgIcon, useTheme } from '@mui/material'

export const OnlineDot = () => {
  const theme = useTheme()

  return (
    <SvgIcon
      sx={{
        backgroundColor: '#44b700',
        color: '#44b700',
        right: '6px',
        bottom: '6px',
        border: `2px solid ${theme.palette.background.paper}`,
        borderRadius: '50%',
        height: '12px',
        width: '12px',
        viewBox: '0 0 12 12',
      }}
    >
      <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" />
      </svg>
    </SvgIcon>
  )
}
