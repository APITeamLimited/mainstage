import { GetBearerPubkeyScopes } from 'web/types/graphql'

import { BaseEntity } from '..'

export interface Workspace extends BaseEntity {
  __typename: 'Workspace'
  remote: boolean
  isTeam: boolean
  scope: GetBearerPubkeyScopes['scopes'][0] | null
}
