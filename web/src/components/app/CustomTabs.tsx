import { Tabs, useTheme, Button, Divider } from '@mui/material'

type CustomTabsProps = {
  value: number
  onChange: (newValue: number) => void
  names: string[]
  icons?: {
    name: string
    icon: React.ReactNode
  }[]
  borderBottom?: boolean
}

export const CustomTabs = ({
  value,
  onChange,
  names,
  icons,
  borderBottom = false,
}: CustomTabsProps) => {
  const theme = useTheme()

  const handleTabChange = (
    _: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    onChange(newValue)
  }

  return (
    <>
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
        style={{
          // Correction for overly large uncotnrollable inner component height.
          // Having no marginBottom would be the most pure way, but not sure if
          // it looks as good as the marginBottoms below.
          //marginBottom: '-1em',
          //marginBottom: '-0.25em',
          overflow: 'visible',
        }}
      >
        {names.map((name, index) => {
          const endIcon =
            icons?.find((icon) => icon.name === name)?.icon ?? undefined

          return (
            <Button
              sx={{
                marginRight: index === names.length - 1 ? 0 : 2,
                color:
                  value === index ? undefined : theme.palette.text.secondary,
                textTransform: 'none',
              }}
              onClick={() => onChange(index)}
              key={index}
              //size="small"
              endIcon={endIcon}
            >
              {name}
            </Button>
          )
        })}
      </Tabs>
      {borderBottom && (
        <Divider
          sx={{
            // Shift up to match the bottom of the tabs.
            //bottom: '10px',
            position: 'relative',
          }}
        />
      )}
    </>
  )
}
