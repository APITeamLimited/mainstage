import { makeVar } from '@apollo/client'

export type UserSettings = {
  keyboardShortcuts: {
    commandPalette: string
  }
}

export const defaultUserSettings: UserSettings = {
  keyboardShortcuts: {
    commandPalette: 'ctrl+shift+g',
  },
}

export const userSettingsVar = makeVar(defaultUserSettings)
