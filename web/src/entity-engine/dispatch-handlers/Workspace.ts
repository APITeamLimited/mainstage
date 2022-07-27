import { makeVar, useReactiveVar } from '@apollo/client'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { PlanInfo } from '../../../../entity-engine/src/entities'

import { processProjects } from './Projects'

export const processWorkspace = (doc: Y.Doc) => {
  const rootMap = doc.getMap()
  const planInfo = rootMap.get('planInfo') as PlanInfo

  if (!planInfo) {
    throw 'No plan info found'
  }

  processProjects(doc.getMap('projects'))

  planInfoVar(planInfo)
}

export type Workspace = {
  planInfo: PlanInfo
}

export const planInfoVar = makeVar<PlanInfo | null>(null)

export const workspaceVar = makeVar<Y.Doc | null>(null)
