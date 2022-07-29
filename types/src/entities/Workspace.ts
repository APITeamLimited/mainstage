import { BaseEntity } from '.'

export type PlanInfo =
  | {
      type: 'LOCAL'
      remote: false
      isTeam: false
    }
  | {
      type: 'FREE'
      remote: true
      isTeam: boolean
    }
  | {
      type: 'PRO'
      remote: true
      isTeam: boolean
    }
  | {
      type: 'ENTERPRISE'
      remote: true
      isTeam: true
    }

export interface Workspace extends BaseEntity {
  __typename: 'Workspace'
  planInfo: PlanInfo
  name: string
}
