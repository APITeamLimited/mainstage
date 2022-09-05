import React, { createContext, useContext } from 'react'

import { getTheme } from '@apiteam/web/src/theme'
import { ThemeProvider } from '@mui/material'

import { MailmanInput } from './lib'

type MailmanProviderProps = {
  children?: React.ReactNode
  input: MailmanInput<unknown>
}

const DataContext = createContext<MailmanInput<unknown>>(null)
export const useInput = () => useContext(DataContext)

export const MailmanProvider = ({ children, input }: MailmanProviderProps) => {
  return (
    <ThemeProvider
      theme={getTheme({
        mode: 'light',
      })}
    >
      <DataContext.Provider value={input}>{children}</DataContext.Provider>
    </ThemeProvider>
  )
}
