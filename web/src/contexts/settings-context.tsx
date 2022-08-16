import { createContext, useEffect, useState } from 'react'
import type { FC, ReactNode } from 'react'

import PropTypes from 'prop-types'

import { useIsBrowser } from '@redwoodjs/prerender/browserUtils'
import { BrowserOnly } from '@redwoodjs/prerender/browserUtils'

export interface Settings {
  direction?: 'ltr' | 'rtl'
  responsiveFontSizes?: boolean
  theme: 'light' | 'dark'
}

export interface SettingsContextValue {
  settings: Settings
  saveSettings: (update: Settings) => void
}

interface SettingsProviderProps {
  children?: ReactNode
}

const initialSettings: Settings = {
  direction: 'ltr',
  responsiveFontSizes: true,
  theme: 'light',
}

export const restoreSettings = (): Settings | null => {
  let settings = null

  try {
    const storedData: string | null =
      globalThis.localStorage.getItem('settings')

    if (storedData) {
      settings = JSON.parse(storedData)
    } else {
      settings = {
        direction: 'ltr',
        responsiveFontSizes: true,
        theme: globalThis.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      }
    }
  } catch (err) {
    console.log(err, 'using initialSettings')
    settings = initialSettings
  }

  return settings
}

export const storeSettings = (settings: Settings): void => {
  globalThis.localStorage.setItem('settings', JSON.stringify(settings))
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: initialSettings,
  saveSettings: () => {},
})

export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const isBrowser = useIsBrowser()
  const settingsState = useState<Settings>(initialSettings)

  useEffect(() => {
    const restoredSettings = restoreSettings()

    if (restoredSettings) {
      settingsState[1](restoredSettings)
    }
  }, [settingsState])

  const saveSettings = (updatedSettings: Settings): void => {
    settingsState[1](updatedSettings)
    storeSettings(updatedSettings)
  }

  return (
    <BrowserOnly>
      <SettingsContext.Provider
        value={{
          settings: isBrowser ? settingsState[0] : initialSettings,
          saveSettings,
        }}
      >
        {children}
      </SettingsContext.Provider>
    </BrowserOnly>
  )
}

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const SettingsConsumer = SettingsContext.Consumer
