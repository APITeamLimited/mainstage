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
}: {
  request: RESTRequest
  scopeId: string
  activeEnvironment: Environment | null
  jobQueue: QueuedJob[]
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
  }

  jobQueueVar([...jobQueue, job])
  return job
}
