import { Chip, Grid, Box, Typography, useTheme } from '@mui/material'

type SecondaryChipsProps = {
  value: number
  onChange: (newValue: number) => void
  names: string[]
}

export const SecondaryChips = ({
  value,
  onChange,
  names,
}: SecondaryChipsProps) => {
  const theme = useTheme()

  return (
    <Box marginRight={1}>
      <Grid container spacing={2} margin={0}>
        {names.map((name, index) => (
          <Chip
            color="primary"
            key={index}
            label={
              <Typography
                sx={{
                  color:
                    value === index ? 'inherit' : theme.palette.text.secondary,
                }}
              >
                {name}
              </Typography>
            }
            variant={value === index ? 'filled' : 'outlined'}
            onClick={() => onChange(index)}
            size="small"
            sx={{
              marginRight: 1,
              marginBottom: 1,
              borderWidth: value === index ? undefined : 0,
            }}
          />
        ))}
      </Grid>
    </Box>
  )
}
