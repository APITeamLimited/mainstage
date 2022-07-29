import { makeVar } from '@apollo/client'

export const defaultEnvironmentsMap = {}

export const activeEnvironmentVar = makeVar(defaultEnvironmentsMap)
