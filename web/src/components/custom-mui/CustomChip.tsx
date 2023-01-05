import { Chip, ChipProps } from '@mui/material'

export type CustomChipProps = ChipProps

export const CustomChip = (props: CustomChipProps) => (
  <Chip
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
      marginRight: '4px',
      ...props.sx,
    }}
    {...props}
  />
)
