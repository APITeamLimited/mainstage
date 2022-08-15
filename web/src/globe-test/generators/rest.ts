import * as queryString from 'query-string'
import { RESTRequest, Environment } from 'types/src'
import { v4 as uuid } from 'uuid'

import { BaseJob, jobQueueVar, PendingJob, QueuedJob } from '../lib'
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
}): BaseJob & PendingJob => {
  const axiosConfig = getFinalRequest(request, activeEnvironment)
  const sourceName = 'rest-single.js'

  const queryEncoded = `?${queryString.stringify(axiosConfig.params)}`

  const source = `import http from 'apiteam/http';

  export default function() {
    const req = {
      method: '${axiosConfig.method}',
      url: '${axiosConfig.url}${queryEncoded.length > 1 ? queryEncoded : ''}',
      body: ${JSON.stringify(axiosConfig.data)},
      params: {
        headers: ${JSON.stringify(axiosConfig.headers)},
      }
    }

    const startTime = new Date().toISOString();
    const res = http.request(req);
    const endTime = new Date().toISOString();

    console.log({
      startTime: startTime,
      endTime: endTime,
      res,
      logType: 'rest-single'
    });
  }`

  const job: BaseJob & PendingJob = {
    localId: uuid(),
    agent: 'GlobeTest',
    underlyingRequest: request,
    createdAt: new Date(),
    jobStatus: 'pending',
    source,
    sourceName,
    scopeId,
    messages: [],
  }

  jobQueueVar([...jobQueue, job])
  return job
}
