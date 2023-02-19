/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionParams,
  GlobeTestMessage,
  WrappedExecutionParams,
} from '@apiteam/types'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { HashSumModule } from 'src/contexts/imports'
import { kvExporter, kvLegacyImporter } from 'src/utils/key-values'

export type GlobeTestVariablesMessage = GlobeTestMessage & {
  messageType: 'ENVIRONMENT_VARIABLES' | 'COLLECTION_VARIABLES'
}

export const handleVariableUpdates = (
  message: GlobeTestVariablesMessage,
  workspace: YDoc,
  params: WrappedExecutionParams,
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  hashSumModule: HashSumModule,
  activeEnvironmentYMap: YMap<any> | null
) => {
  if (message.messageType === 'COLLECTION_VARIABLES') {
    handleCollectionVariableUpdates(
      message,
      workspace,
      params,
      collectionContext,
      hashSumModule
    )
    return
  }

  handleEnvironmentVariableUpdates(
    message,
    environmentContext,
    hashSumModule,
    activeEnvironmentYMap
  )
}

const handleEnvironmentVariableUpdates = (
  message: GlobeTestVariablesMessage,
  environmentContext: ExecutionParams['environmentContext'],
  hashSumModule: HashSumModule,
  activeEnvironmentYMap: YMap<any> | null
) => {
  const { default: hash } = hashSumModule

  if (hash(message.message) === hash(environmentContext)) {
    // No changes to the variables
    return
  }

  if (!activeEnvironmentYMap) {
    throw new Error(
      `Cannot set environment variables without an active environment`
    )
  }

  const environmentVariables = kvLegacyImporter(
    'variables',
    activeEnvironmentYMap,
    'localvalue'
  )

  // Clear deleted variables
  const messageKeys = Object.keys(message.message)
  environmentVariables.forEach((variable) => {
    if (!messageKeys.includes(variable.keyString)) {
      variable.localValue = {
        ...variable.localValue,
        data: null,
      }
    }
  })

  // Update changed variables
  environmentVariables.forEach((variable) => {
    const newValue = message.message[variable.keyString]

    if (newValue === undefined) {
      return
    }

    if (
      newValue === variable.value &&
      (variable.localValue.data === '' || variable.localValue.data === null)
    ) {
      return
    }

    if (newValue === variable.value) {
      variable.localValue = {
        ...variable.localValue,
        data: null,
      }
      return
    }

    variable.localValue = {
      ...variable.localValue,
      data: newValue,
    }
  })

  activeEnvironmentYMap.set(
    'variables',
    kvExporter(
      environmentVariables,
      'localvalue',
      activeEnvironmentYMap.doc?.guid as string
    )
  )
}

const handleCollectionVariableUpdates = (
  message: GlobeTestVariablesMessage,
  workspace: YDoc,
  params: WrappedExecutionParams,
  collectionContext: ExecutionParams['collectionContext'],
  hashSumModule: HashSumModule
) => {
  const { default: hash } = hashSumModule

  const collectionYMap = workspace
    .getMap<any>('projects')
    ?.get(params.projectId)
    ?.get('branches')
    ?.get(params.branchId)
    ?.get('collections')
    ?.get(params.collectionId) as YMap<any> | undefined

  if (!collectionYMap) {
    throw new Error(`Couldn't find collection with id ${params.collectionId}`)
  }

  if (hash(message.message) === hash(collectionContext)) {
    // No changes to the variables
    return
  }

  const collectionVariables = kvLegacyImporter(
    'variables',
    collectionYMap,
    'localvalue'
  )

  // Clear deleted variables
  const messageKeys = Object.keys(message.message)
  collectionVariables.forEach((variable) => {
    if (!messageKeys.includes(variable.keyString)) {
      variable.localValue = {
        ...variable.localValue,
        data: null,
      }
    }
  })

  // Update changed variables
  collectionVariables.forEach((variable) => {
    const newValue = message.message[variable.keyString]

    if (newValue === undefined) {
      return
    }

    if (
      newValue === variable.value &&
      (variable.localValue.data === '' || variable.localValue.data === null)
    ) {
      return
    }

    if (newValue === variable.value) {
      variable.localValue = {
        ...variable.localValue,
        data: null,
      }
      return
    }

    variable.localValue = {
      ...variable.localValue,
      data: newValue,
    }
  })

  collectionYMap.set(
    'variables',
    kvExporter(
      collectionVariables,
      'localvalue',
      collectionYMap.doc?.guid as string
    )
  )
}
