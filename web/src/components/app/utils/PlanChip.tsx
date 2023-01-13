import { useTheme } from '@mui/material'

import { CustomChip } from 'src/components/custom-mui'

type PlanChipProps = {
  name: string
  hideIfFree?: boolean
}

export const PlanChip = ({ name, hideIfFree }: PlanChipProps) => {
  const theme = useTheme()

  if (hideIfFree && name === 'Free') {
    return <></>
  }

  return (
    <CustomChip
      label={name}
      size="small"
      variant={name === 'Free' ? 'outlined' : 'filled'}
      color={name === 'Free' ? undefined : 'primary'}
      sx={{
        backgroundColor:
          name === 'Free'
            ? undefined
            : theme.palette.mode === 'light'
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
      }}
    />
  )
}
