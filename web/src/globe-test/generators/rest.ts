import * as queryString from 'query-string'
import { RESTRequest, Environment } from 'types/src'
import { v4 as uuid } from 'uuid'

import { BaseJob, jobQueueVar, PendingLocalJob, QueuedJob } from '../lib'
import { getFinalRequest } from '../rest'

/*
Creates a new single rest job and adds it to the queue.
*/
export const singleRESTRequestGenerator = ({
  request,
  scopeId,
  activeEnvironment,
  jobQueue,
  requestYMap,
}: {
  request: RESTRequest
  scopeId: string
  activeEnvironment: Environment | null
  jobQueue: QueuedJob[]
  requestYMap: Y.Map<any>
}): BaseJob & PendingLocalJob => {
  const axiosConfig = getFinalRequest(request, activeEnvironment)
  const sourceName = 'rest-single.js'

  const queryEncoded = `?${queryString.stringify(axiosConfig.params)}`

  const source = `import http from 'k6/http';
  import { tag } from 'apiteam';
  import { sleep } from 'k6';

  export default function() {
    const req = {
      method: '${axiosConfig.method}',
      url: '${axiosConfig.url}${queryEncoded.length > 1 ? queryEncoded : ''}',
      body: ${JSON.stringify(axiosConfig.data)},
      params: {
        headers: ${JSON.stringify(axiosConfig.headers)},
      }
    }

    const res = http.request(...Object.values(req));

    tag("RESTResult", res);
  }`

  const collection = requestYMap.parent.parent
  const branch = collection.parent.parent
  const project = branch.parent.parent

  const collectionId = collection.get('id')
  const branchId = branch.get('id')
  const projectId = project.get('id')

  if (!collectionId || !branchId || !projectId) {
    throw new Error(
      `Invalid request: ${requestYMap.id} ${collectionId} ${branchId} ${projectId} must have a valid parent`
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
  }

  jobQueueVar([...jobQueue, job])
  return job
}
