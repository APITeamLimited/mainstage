import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseEntity } from '.'

export interface LocalEnvironment extends BaseEntity {
  __typename: 'LocalEnvironment'
  parentId: string
  __parentTypename: 'LocalProject'
  name: string
  variables: {
    keyString: string
    value: string
    enabled: boolean
  }[]
}

type GenerateLocalEnvironmentProps = {
  parentId: string
  __parentTypename: 'LocalProject'
  name?: string
  variables?: {
    keyString: string
    value: string
    enabled: boolean
  }[]
  createdAt?: Date | null
}

export const generateLocalEnvironment = ({
  parentId,
  __parentTypename,
  name,
  variables,
  createdAt,
}: GenerateLocalEnvironmentProps): LocalEnvironment => {
  return {
    id: uuidv4(),
    name: name || 'New Environment',
    createdAt: createdAt || new Date(),
    updatedAt: createdAt ? new Date() : null,
    __typename: 'LocalEnvironment',
    parentId,
    __parentTypename,
    variables: variables || [],
  }
}

export const localEnvironmentsVar = makeVar(<LocalEnvironment[]>[])
