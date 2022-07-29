import { makeVar } from '@apollo/client'

export type UserProjectBranch = {
  projectId: string
  branchId: string
}

export const userProjectBranchesVar = makeVar<UserProjectBranch[]>([])
