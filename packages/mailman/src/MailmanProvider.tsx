import React, { createContext, useContext } from 'react'

import { getTheme } from '@apiteam/types'
import { ThemeProvider } from '@mui/material'

import { MailmanInput } from './lib'

type MailmanProviderProps = {
  children?: React.ReactNode
  input: MailmanInput<any>
}

const DataContext = createContext<MailmanInput<any>>(null)
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
