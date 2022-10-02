import { createContext, useEffect, useState } from 'react'
import type { FC, ReactNode } from 'react'

import PropTypes from 'prop-types'

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

export const SettingsContext = createContext<SettingsContextValue>({
  settings: initialSettings,
  saveSettings: () => {},
})

export const SettingsProvider: React.FC = ({ children }: SettingsProviderProps) => {
  //const browser = useIsBrowser()
  const [settings, setSettings] = useState<Settings>(initialSettings)

  // Change browser color scheme based on theme
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-color-scheme',
      settings.theme ?? 'light'
    )
  }, [settings])

  useEffect(() => {
    const restoredSettings = restoreSettings()

    if (restoredSettings) {
      setSettings(restoredSettings)
    }
  }, [])

  const saveSettings = (updatedSettings: Settings): void => {
    setSettings(updatedSettings)
    globalThis.localStorage.setItem('settings', JSON.stringify(updatedSettings))
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

//const SettingsProviderInner = (props: SettingsProviderProps) => {
//  const [settings, setSettings] = useState<Settings>(initialSettings)
//  const saveSettings = (updatedSettings: Settings): void => {
//    setSettings(updatedSettings)
//    globalThis.localStorage.setItem('settings', JSON.stringify(updatedSettings))
//  }
//
SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const SettingsConsumer = SettingsContext.Consumer
