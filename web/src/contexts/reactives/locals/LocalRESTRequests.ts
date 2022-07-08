import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseLocal } from '.'

export interface LocalRESTRequest extends BaseLocal {
  __typename: 'LocalRESTRequest'
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name: string
  orderingIndex: number
}

type GenerateLocalRESTRequestProps = {
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name?: string
  createdAt?: Date | null
  orderingIndex: number | undefined
}

export const generateLocalRESTRequest = ({
  parentId,
  __parentTypename,
  name,
  createdAt,
  orderingIndex,
}: GenerateLocalRESTRequestProps): LocalRESTRequest => {
  return {
    id: uuidv4(),
    name: name || 'New REST Request',
    createdAt: new Date(),
    updatedAt: createdAt ? new Date() : null,
    __typename: 'LocalRESTRequest',
    parentId,
    __parentTypename,
    orderingIndex: orderingIndex || 0,
  }
}

export const localRESTRequestsVar = makeVar(<LocalRESTRequest[]>[])
