import { CustomChip } from 'src/components/custom-mui'

type PlanChipProps = {
  name: string
  hideIfFree?: boolean
}

export const PlanChip = ({ name, hideIfFree }: PlanChipProps) => {
  if (hideIfFree && name === 'Free') {
    return <></>
  }

  return (
    <CustomChip
      label={name}
      size="small"
      variant={name === 'Free' ? 'outlined' : 'filled'}
      color={name === 'Free' ? undefined : 'primary'}
    />
  )
}
