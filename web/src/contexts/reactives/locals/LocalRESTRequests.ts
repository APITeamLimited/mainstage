import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseLocal } from '.'

export interface LocalRESTRequest extends BaseLocal {
  __typename: 'LocalRESTRequest'
  parentId: string
  __parentTypename: 'LocalCollection'
  name: string
}

export const generateLocalRESTRequest = (name?: string): LocalRESTRequest => {
  return {
    id: uuidv4(),
    name: name || 'New REST Request',
    createdAt: new Date(),
    updatedAt: null,
  } as LocalRESTRequest
}

export const localRESTRequestsVar = makeVar(<LocalRESTRequest[]>[])
