import { useTheme, Stack, Typography } from '@mui/material'

type PaymentSectionItemProps = {
  title: string
  description: string
}

export const PaymentSectionItem = ({
  title,
  description,
}: PaymentSectionItemProps) => {
  const theme = useTheme()

  return (
    <Stack spacing={1}>
      <Typography variant="body1" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        {description}
      </Typography>
    </Stack>
  )
}
