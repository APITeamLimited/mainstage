import type { Map as YMap } from 'yjs'

import {
  Collection,
  ExecutionOptions,
  ExecutionScript,
  Folder,
  oauth2LoadLocal,
  RESTRequest,
} from '../../../entities'
import type { ExecutionParams } from '../../../execution-params'
import {
  BULTIN_MULTI_SCRIPTS,
  BUILTIN_REST_SCRIPTS,
} from '../../example-scripts'
import type {
  TestData,
  SourceScript,
  HTTPRequestNode,
  Node,
} from '../test-data'

import { restFinalRequest } from './request-types/rest'

export type GenerateTestDataArgs = {
  rootScript: SourceScript
  nodeYMap: YMap<any>
  collectionYMap: YMap<any>
  collectionContext: ExecutionParams['collectionContext']
  environmentContext: ExecutionParams['environmentContext']
  firstLevelData:
    | {
        variant: 'httpRequest'
        subVariant: 'RESTRequest'
        underlyingRequest: RESTRequest
      }
    | {
        variant: 'group'
        subVariant: 'Collection'
        collection: Collection
      }
    | {
        variant: 'group'
        subVariant: 'Folder'
        folder: Folder
      }
    | null
  oauthLocalSaveKey?: string
}

export const generateTestData = async (
  args: GenerateTestDataArgs
): Promise<TestData> => {
  const executionOptions = getExecutionOptions(args.firstLevelData)

  return {
    rootScript: args.rootScript,
    rootNode: await recursiveNode({
      ...args,
      isRoot: true,
      executionOptions,
    }),
    compilerOptions: {
      multipleScripts: executionOptions.multipleScripts,
    },
  }
}

type RecursiveNodeArgs = GenerateTestDataArgs & {
  isRoot: boolean
  executionOptions: ExecutionOptions
}

const recursiveNode = async (args: RecursiveNodeArgs): Promise<Node> => {
  const nodeTypename = args.nodeYMap.get('__typename')

  if (nodeTypename === 'RESTRequest') {
    return await httpRequestNode(args)
  } else if (nodeTypename === 'Collection' || nodeTypename === 'Folder') {
    return await groupNode(args)
  }

  throw new Error('Not implemented')
}

const httpRequestNode = async ({
  nodeYMap,
  collectionYMap,
  firstLevelData,
  oauthLocalSaveKey,
  collectionContext,
  environmentContext,
  isRoot,
  rootScript,
  executionOptions,
}: RecursiveNodeArgs): Promise<HTTPRequestNode> => {
  const executionScripts = (): ExecutionScript[] => {
    const executionScripts =
      isRoot && firstLevelData?.subVariant === 'RESTRequest'
        ? firstLevelData.underlyingRequest.executionScripts
        : [...BUILTIN_REST_SCRIPTS, ...getSavedNodeExecutionScripts(nodeYMap)]
    return executionScripts
  }

  const sourceScripts = (
    executionScripts: ExecutionScript[]
  ): SourceScript[] => {
    let sourceScripts = executionScripts.map((executionScript) => ({
      name: executionScript.name,
      contents: executionScript.script,
    }))

    // If this is the root node, add the root script
    if (isRoot) {
      sourceScripts = [
        ...sourceScripts.filter(
          (sourceScript) => sourceScript.name !== rootScript.name
        ),
        rootScript,
      ]
    }

    return sourceScripts
  }

  const underlyingRequest =
    firstLevelData?.subVariant === 'RESTRequest'
      ? firstLevelData.underlyingRequest
      : {
          id: nodeYMap.get('id'),
          __typename: nodeYMap.get('__typename'),
          parentId: nodeYMap.get('parentId'),
          __parentTypename: nodeYMap.get('__parentTypename'),
          orderingIndex: nodeYMap.get('orderingIndex'),
          createdAt: nodeYMap.get('createdAt'),
          updatedAt: nodeYMap.get('updatedAt')
            ? nodeYMap.get('updatedAt')
            : null,
          name: nodeYMap.get('name'),
          endpoint: nodeYMap.get('endpoint'),
          headers: nodeYMap.get('headers'),
          params: nodeYMap.get('params'),
          body: nodeYMap.get('body'),
          method: nodeYMap.get('method'),
          auth: oauth2LoadLocal(nodeYMap.get('auth'), oauthLocalSaveKey),
          pathVariables: nodeYMap.get('pathVariables'),
          description: nodeYMap.get('description'),
          executionScripts: executionScripts(),
          executionOptions: nodeYMap.get('executionOptions'),
        }

  return {
    variant: 'httpRequest',
    id: nodeYMap.get('id'),
    name:
      firstLevelData?.subVariant === 'RESTRequest'
        ? firstLevelData.underlyingRequest.name
        : nodeYMap.get('name'),
    finalRequest:
      nodeYMap.get('__typename') === 'RESTRequest'
        ? await restFinalRequest(
            underlyingRequest,
            nodeYMap,
            collectionYMap,
            environmentContext,
            collectionContext,
            executionOptions
          )
        : (() => {
            throw new Error('Not implemented')
          })(),
    scripts: sourceScripts(underlyingRequest.executionScripts).filter(
      (script) => {
        if (executionOptions.multipleScripts) {
          return true
        }

        return isRoot && script.name === rootScript.name
      }
    ),
    subVariant: 'RESTRequest',
    underlyingRequest,
  }
}

const groupNode = async ({
  nodeYMap,
  collectionYMap,
  firstLevelData,
  oauthLocalSaveKey,
  collectionContext,
  environmentContext,
  isRoot,
  rootScript,
  executionOptions,
}: RecursiveNodeArgs): Promise<Node> => {
  const restRequestYMaps = Array.from(
    collectionYMap.get('restRequests').values()
  ) as YMap<any>[]

  const folderYMaps = Array.from(
    collectionYMap.get('folders').values()
  ) as YMap<any>[]

  // Filter to those whose parentId is the current node
  const childYMaps = [...restRequestYMaps, ...folderYMaps].filter(
    (childYMap) => childYMap.get('parentId') === nodeYMap.get('id')
  )

  const childNodes = await Promise.all(
    childYMaps.map((nodeYMap) =>
      recursiveNode({
        nodeYMap,
        collectionYMap,
        collectionContext,
        environmentContext,
        firstLevelData,
        oauthLocalSaveKey,
        isRoot: false,
        rootScript,
        executionOptions,
      })
    )
  )

  const sourceScripts = (): SourceScript[] => {
    if (
      isRoot &&
      firstLevelData?.subVariant !== 'Collection' &&
      firstLevelData?.subVariant !== 'Folder'
    ) {
      throw new Error(
        `Invalid first level data, root nodes need to be Collection or Folder types, got: ${firstLevelData?.subVariant}`
      )
    }

    let sourceScripts = []

    if (isRoot && firstLevelData?.subVariant === 'Collection') {
      sourceScripts = firstLevelData.collection.executionScripts.map(
        (script) => ({
          name: script.name,
          contents: script.script,
        })
      )
    } else if (isRoot && firstLevelData?.subVariant === 'Folder') {
      sourceScripts = firstLevelData.folder.executionScripts.map((script) => ({
        name: script.name,
        contents: script.script,
      }))
    } else {
      sourceScripts = (
        [
          ...BULTIN_MULTI_SCRIPTS,
          ...getSavedNodeExecutionScripts(nodeYMap),
        ] as ExecutionScript[]
      )
        .map((script) => ({
          name: script.name,
          contents: script.script,
        }))
        .filter((script) => {
          if (executionOptions.multipleScripts) {
            return true
          }

          return isRoot && script.name === rootScript.name
        })
    }

    // If is root, ensure that the root script is included and overwrites any other script with the same name
    if (isRoot) {
      sourceScripts = [
        ...sourceScripts.filter((script) => script.name !== rootScript.name),
        rootScript,
      ]
    }

    return sourceScripts
  }

  return {
    variant: 'group',
    id: nodeYMap.get('id'),
    name: nodeYMap.get('name'),
    children: childNodes,
    scripts: sourceScripts(),
    subVariant: nodeYMap.get('__typename'),
  }
}

const getExecutionOptions = (
  firstLevelData: GenerateTestDataArgs['firstLevelData']
): ExecutionOptions => {
  const executionOptions =
    firstLevelData?.subVariant === 'RESTRequest'
      ? firstLevelData.underlyingRequest.executionOptions
      : firstLevelData?.subVariant === 'Collection'
      ? firstLevelData.collection.executionOptions
      : firstLevelData?.subVariant === 'Folder'
      ? firstLevelData.folder.executionOptions
      : null

  if (!executionOptions) {
    throw new Error(
      'Could not find execution options, invalid first level data'
    )
  }

  return executionOptions
}

const getSavedNodeExecutionScripts = (
  nodeYMap: YMap<any>
): ExecutionScript[] => {
  let executionScripts = nodeYMap.get('executionScripts')

  if (!executionScripts) {
    nodeYMap.set('executionScripts', [])
    executionScripts = nodeYMap.get('executionScripts')
  }

  return Array.from(
    nodeYMap.get('executionScripts').values()
  ) as ExecutionScript[]
}
