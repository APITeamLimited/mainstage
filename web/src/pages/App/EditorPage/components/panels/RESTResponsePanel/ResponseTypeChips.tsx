import { Chip, Typography, useTheme } from '@mui/material'

type ResponseTypeChipsProps = {
  value: number
  onChange: (newValue: number) => void
  names: string[]
}

export const ResponseTypeChips = ({
  value,
  onChange,
  names,
}: ResponseTypeChipsProps) => {
  const theme = useTheme()

  return (
    <>
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
          variant="outlined"
          onClick={() => onChange(index)}
          size="small"
          sx={{
            borderWidth: value === index ? undefined : 0,
            marginRight: index === names.length - 1 ? 0 : 1,
          }}
        />
      ))}
    </>
  )
}
