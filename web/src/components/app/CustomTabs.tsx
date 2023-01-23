import { Tabs, useTheme, Divider, Typography } from '@mui/material'

export const CUSTOM_TABS_HEIGHT = '40px'

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
          sx: {
            backgroundColor: theme.palette.primary.main,
            //top: '30px',
            bottom: '0.8rem',
          },
        }}
        style={{
          // Correction for overly large uncotnrollable inner component height.
          // Having no marginBottom would be the most pure way, but not sure if
          // it looks as good as the marginBottoms below.
          overflow: 'hidden',
          height: CUSTOM_TABS_HEIGHT,
        }}
      >
        {names.map((name, index) => {
          // const endIcon =
          //   icons?.find((icon) => icon.name === name)?.icon ?? undefined

          return (
            <Typography
              sx={{
                marginRight: index === names.length - 1 ? 0 : 2,
                color:
                  value === index
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                padding: '0.25rem',
                paddingBottom: 0,
                userSelect: 'none',
                cursor: 'pointer',
              }}
              onClick={() => onChange(index)}
              key={index}
              fontWeight="bold"
            >
              {name}
            </Typography>
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
