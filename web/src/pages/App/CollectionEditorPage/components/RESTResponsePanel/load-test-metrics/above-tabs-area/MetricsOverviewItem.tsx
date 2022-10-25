import {
  Card,
  Stack,
  Typography,
  Grid,
  useTheme,
  TypographyProps,
} from '@mui/material'

type MetricsOverviewItemProps = {
  name: string
  value: string
  valueColor?: TypographyProps['color']
  units?: string
}

export const MetricsOverviewItem = ({
  name,
  value,
  valueColor,
  units,
}: MetricsOverviewItemProps) => {
  const theme = useTheme()

  return (
    <Grid item>
      <Card sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {name}:
          </Typography>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography
              variant="h6"
              color={valueColor ?? theme.palette.text.primary}
              fontWeight="bold"
            >
              {value}
            </Typography>
            {units && (
              <Typography
                color={theme.palette.text.secondary}
                variant="caption"
              >
                {units}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Card>
    </Grid>
  )
}
