import { Branch, Collection, Project } from '@apiteam/types'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { UserProjectBranch } from 'src/contexts/reactives/UserBranches'

export const findActiveBranch = ({
  branches,
  userProjectBranches,
  project,
}: {
  branches: Record<string, Branch>
  userProjectBranches: UserProjectBranch[]
  project: Project
}): Branch | null => {
  // See if projectId is in userProjectBranches
  const userProjectBranch = userProjectBranches.find(
    (userProjectBranch) => userProjectBranch.projectId === project.id
  )

  if (userProjectBranch) {
    // See if branchId is in branches
    const branch = branches[userProjectBranch.branchId]

    // If branch is found, return it
    if (branch) return branch
  }

  // Try and find main branch, the branches parent is the project
  const mainBranch = Object.entries(branches).find(([, branch]) => {
    return branch.name === 'main'
  })

  if (!mainBranch) {
    //throw `Could not find a valid branch for project ${project.id}`
    return null
  }

  return mainBranch[1] as Branch
}

export type SortOption = 'Most Recent' | 'Alphabetical' | 'Creation Date'

export type OverviewType = {
  overviewItem: Collection
  yMap: YMap<any>
}

export const sortOverviewItems = (
  sortOption: SortOption,
  sortAscending: boolean,
  unsortedOverviews: OverviewType[]
) => {
  if (sortOption === 'Most Recent') {
    return unsortedOverviews.sort((a, b) =>
      sortAscending
        ? new Date(a.lastViewedAt).getDate() -
          new Date(b.lastViewedAt).getDate()
        : new Date(b.lastViewedAt).getDate() -
          new Date(a.lastViewedAt).getDate()
    )
  } else if (sortOption === 'Alphabetical') {
    return unsortedOverviews.sort((a, b) =>
      sortAscending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
  } else if (sortOption === 'Creation Date') {
    return unsortedOverviews.sort((a, b) =>
      sortAscending
        ? new Date(a.createdAt).getDate() - new Date(b.createdAt).getDate()
        : new Date(b.createdAt).getDate() - new Date(a.createdAt).getDate()
    )
  }
  throw `Unknown sort option: ${sortOption}`
}
