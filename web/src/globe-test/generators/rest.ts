import { RESTRequest } from '@apiteam/types'
import * as queryString from 'query-string'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { createEnvironmentContext } from 'src/utils/environment'

import { BaseJob, jobQueueVar, PendingLocalJob, QueuedJob } from '../lib'
import { getFinalRequest } from '../rest'

/*
Creates a new single rest job and adds it to the queue.
*/
export const singleRESTRequestGenerator = async ({
  request,
  scopeId,
  rawBearer,
  activeEnvironmentYMap,
  jobQueue,
  requestYMap,
  collectionYMap,
}: {
  request: RESTRequest
  scopeId: string
  rawBearer: string
  activeEnvironmentYMap: Y.Map<any> | null
  jobQueue: QueuedJob[]
  requestYMap: Y.Map<any>
  collectionYMap: Y.Map<any>
}): Promise<BaseJob & PendingLocalJob> => {
  const axiosConfig = await getFinalRequest(
    request,
    requestYMap,
    activeEnvironmentYMap,
    collectionYMap
  )
  const sourceName = 'rest-single.js'

  const queryEncoded = `?${queryString.stringify(axiosConfig.params)}`

  const source = `import http from 'k6/http';
  import {sleep} from 'k6';
  import { mark } from 'apiteam';

  export const options = {
    vus: 1,
    iterations: 1,
    executionMode: 'rest_single',
    //httpDebug: 'full',
    //scenarios: {
    //  contacts: {
    //    executor: 'constant-vus',
    //    vus: 2,
    //    duration: '2s',
    //    //gracefulRampDown: '3s',
    //  },
    //},
  };

  export default function() {
    const req = {
      method: '${axiosConfig.method}',
      url: '${axiosConfig.url}${queryEncoded.length > 1 ? queryEncoded : ''}',
      data: ${JSON.stringify(axiosConfig.data)},
      params: {
        headers: ${JSON.stringify(axiosConfig.headers)},
      }
    }


    const res = http.request(...Object.values(req));

    if (__ITER == 0) {
      mark("RESTResult", res);
    }
    //mark("RESTResult", res);
  }`

  const branch = collectionYMap.parent.parent
  const project = branch.parent.parent

  const collectionId = collectionYMap.get('id')
  const branchId = branch.get('id')
  const projectId = project.get('id')

  if (!collectionId || !branchId || !projectId) {
    throw new Error(
      `Invalid request: ${requestYMap.get(
        'id'
      )} ${collectionId} ${branchId} ${projectId} must have a valid parent`
    )
  }

  const job: BaseJob & PendingLocalJob = {
    localId: uuid(),
    agent: 'GlobeTest',
    underlyingRequest: request,
    createdAt: new Date(),
    jobStatus: 'LOCAL_CREATING',
    source,
    sourceName,
    scopeId,
    messages: [],
    projectId: projectId,
    branchId: branchId,
    collectionId: collectionId,
    environmentContext: createEnvironmentContext({
      environment: activeEnvironmentYMap,
      collection: collectionYMap,
    }),
    __subtype: 'PendingLocalJob',
  }

  jobQueueVar([...jobQueue, job])

  return job
}
