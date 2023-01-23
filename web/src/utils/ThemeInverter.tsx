import getTheme from '@apiteam/types/src/theme'
import { ThemeProvider, useTheme } from '@mui/material'

import { SettingsConsumer } from 'src/contexts/settings-context'

type ThemeInverterProps = {
  children: React.ReactNode
  forceMode?: 'light' | 'dark'
}

export const ThemeInverter = ({ children, forceMode }: ThemeInverterProps) => {
  const invertTheme = useTheme()

  const existingMode = invertTheme.palette.mode

  return (
    <SettingsConsumer>
      {({ settings }) => (
        <ThemeProvider
          theme={getTheme({
            direction: settings.direction,
            responsiveFontSizes: settings.responsiveFontSizes,
            mode: forceMode || (existingMode === 'light' ? 'dark' : 'light'),
          })}
        >
          {children}
        </ThemeProvider>
      )}
    </SettingsConsumer>
  )
}
