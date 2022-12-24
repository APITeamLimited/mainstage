import { Stack, Typography, useTheme, Button, Paper } from '@mui/material'

type ActionCardProps = {
  title: string
  description?: string
  buttonText: string
  buttonLink: string
  backgroundColor?: string
  invertFontColor?: boolean
}

import { Link } from '@redwoodjs/router'

export const ActionCard = ({
  title,
  description,
  buttonText,
  buttonLink,
  backgroundColor,
  invertFontColor,
}: ActionCardProps) => {
  const theme = useTheme()

  return (
    <Paper
      sx={{
        backgroundColor: backgroundColor ?? theme.palette.background.paper,
      }}
    >
      <Stack margin={4} spacing={2} alignItems="center">
        <Typography
          variant="h5"
          color={
            invertFontColor
              ? theme.palette.common.white
              : theme.palette.text.primary
          }
          align="center"
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="h6"
            color={
              invertFontColor
                ? theme.palette.common.white
                : theme.palette.text.secondary
            }
            align="center"
          >
            {description}
          </Typography>
        )}
        <Link
          to={buttonLink}
          style={{
            textDecoration: 'none',
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{
              color: invertFontColor ? theme.palette.common.white : undefined,
              borderColor: invertFontColor
                ? theme.palette.common.white
                : undefined,
              '&:hover': {
                borderColor: invertFontColor
                  ? theme.palette.common.white
                  : undefined,
              },
            }}
          >
            {buttonText}
          </Button>
        </Link>
      </Stack>
    </Paper>
  )
}
