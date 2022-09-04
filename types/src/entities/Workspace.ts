import { Scope } from '@prisma/client'

import { BaseEntity } from '..'

export interface Workspace extends BaseEntity {
  __typename: 'Workspace'
  remote: boolean
  isTeam: boolean
  scope: Scope
}
