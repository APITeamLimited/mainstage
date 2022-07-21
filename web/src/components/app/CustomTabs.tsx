import { Tabs, useTheme, Button } from '@mui/material'

type CustomTabsProps = {
  value: number
  onChange: (newValue: number) => void
  names: string[]
}

export const CustomTabs = ({ value, onChange, names }: CustomTabsProps) => {
  const theme = useTheme()

  const handleTabChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    onChange(newValue)
  }

  return (
    <Tabs
      value={value}
      onChange={handleTabChange}
      variant="scrollable"
      TabIndicatorProps={{
        style: {
          backgroundColor: theme.palette.primary.main,
          //top: '30px',
          top: '36px',
        },
      }}
      style={
        {
          // Correction for overly large uncotnrollable inner component height.
          // Having no marginBottom would be the most pure way, but not sure if
          // it looks as good as the marginBottoms below.
          //marginBottom: '-1em',
          //marginBottom: '-0.25em',
        }
      }
    >
      {names.map((name, index) => (
        <Button
          sx={{
            marginRight: index === names.length - 1 ? 0 : 2,
            color: value === index ? undefined : theme.palette.text.secondary,
          }}
          onClick={() => onChange(index)}
          key={index}
          //size="small"
        >
          {name}
        </Button>
      ))}
    </Tabs>
  )
}
