import type { Map as YMap } from 'yjs'

import { oauth2LoadLocal, RESTRequest } from '../../../entities'
import type { ExecutionParams } from '../../../execution-params'
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
  firstLevelData: {
    variant: 'httpRequest'
    subVariant: 'RESTRequest'
    underlyingRequest: RESTRequest
  } | null
  oauthLocalSaveKey?: string
}

export const generateTestData = (args: GenerateTestDataArgs): TestData => ({
  rootScript: args.rootScript,
  rootNode: recursiveNode(args),
})

const recursiveNode = (
  args: Omit<GenerateTestDataArgs, 'rootScript'>
): Node => {
  const nodeTypename = args.nodeYMap.get('__typename')

  if (nodeTypename === 'RESTRequest') {
    return httpRequestNode(args)
  } else if (nodeTypename === 'Collection' || nodeTypename === 'Folder') {
    return groupNode(args)
  }

  throw new Error('Not implemented')
}

const httpRequestNode = ({
  nodeYMap,
  collectionYMap,
  firstLevelData,
  oauthLocalSaveKey,
  collectionContext,
  environmentContext,
}: Omit<GenerateTestDataArgs, 'rootScript'>): HTTPRequestNode => {
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
          executionScripts: nodeYMap.get('executionScripts'),
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
        ? restFinalRequest(
            underlyingRequest,
            nodeYMap,
            collectionYMap,
            environmentContext,
            collectionContext
          )
        : (() => {
            throw new Error('Not implemented')
          })(),
    scripts:
      firstLevelData?.subVariant === 'RESTRequest'
        ? firstLevelData.underlyingRequest.executionScripts
        : nodeYMap.get('executionScripts'),
    subVariant: 'RESTRequest',
    underlyingRequest,
  }
}

const groupNode = ({
  nodeYMap,
  collectionYMap,
  firstLevelData,
  oauthLocalSaveKey,
  collectionContext,
  environmentContext,
}: Omit<GenerateTestDataArgs, 'rootScript'>): Node => {
  const restRequestYMaps = collectionYMap.get('restRequests').values()
  const folderYMaps = collectionYMap.get('folders').values()

  const childNodes = [restRequestYMaps, folderYMaps].map((nodeYMap) =>
    recursiveNode({
      nodeYMap,
      collectionYMap,
      collectionContext,
      environmentContext,
      firstLevelData: null,
      oauthLocalSaveKey,
    })
  )

  return {
    variant: 'group',
    id: nodeYMap.get('id'),
    name: nodeYMap.get('name'),
    // Collection or Folder
    subVariant: nodeYMap.get('__typename'),
    children: childNodes,
  }
}
