import { makeVar } from '@apollo/client'

type ActiveEnvironmentDictionary = {
  [branchId: string]: [activeWorkspaceId: string]
}

export const activeEnvironmentVar = makeVar<ActiveEnvironmentDictionary>({})
