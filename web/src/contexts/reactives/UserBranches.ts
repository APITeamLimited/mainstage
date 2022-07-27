import { makeVar } from '@apollo/client'

type UserProjectBranch = {
  projectId: string
  branchId: string
}

export const userProjectBranchesVar = makeVar<UserProjectBranch[]>([])
