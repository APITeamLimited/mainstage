import { makeVar } from '@apollo/client'

import { LocalEnvironment } from './locals'

export const defaultEnvironment: LocalEnvironment | null = null

export const activeEnvironmentVar =
  makeVar<LocalEnvironment>(defaultEnvironment)
