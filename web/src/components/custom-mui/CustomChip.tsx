import { Chip, ChipProps } from '@mui/material'

export type CustomChipProps = ChipProps

export const CustomChip = (props: CustomChipProps) => (
  <Chip
    {...props}
    sx={{
      fontSize: '10px',
      padding: 0,
      '& .MuiChip-label': {
        paddingX: '6px',
        fontWeight: 'bold',
        userSelect: 'none',
      },
      transistion: 'background-color 0',
      height: '20px',
      ...props.sx,
    }}
  />
)
