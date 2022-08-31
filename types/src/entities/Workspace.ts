import { BaseEntity } from 'types/src'
import { GetBearerPubkeyScopes } from 'web/types/graphql'

export interface Workspace extends BaseEntity {
  __typename: 'Workspace'
  remote: boolean
  isTeam: boolean
  scope: GetBearerPubkeyScopes['scopes'][0] | null
}
