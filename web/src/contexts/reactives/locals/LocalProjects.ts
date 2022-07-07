import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseLocal } from '.'

export interface LocalProject extends BaseLocal {
  __typename: 'LocalProject'
  name: string
}

export const generateLocalProject = ({
  name,
}: {
  name?: string
}): LocalProject => {
  return {
    id: uuidv4(),
    name: name || 'New Project',
    createdAt: new Date(),
    updatedAt: null,
    __typename: 'LocalProject',
  }
}

export const localProjectsVar = makeVar(<LocalProject[]>[])
