import { TagType } from 'types/src'

import { QueuedJob } from '../lib'

type PostProcessRESTRequestArgs = {
  job: QueuedJob
  queueRef: React.MutableRefObject<QueuedJob[] | null>
}

export const postProcessRESTRequest = async ({
  job,
  queueRef,
}: PostProcessRESTRequestArgs): Promise<void> => {
  // Look for a tagged message with the tag 'RESTResult'

  const restResult = job.messages
    .filter((message) => message.messageType === 'TAG')
    .find((message) => (message.message as TagType).tag === 'RESTResult')

  if (!restResult) {
    throw new Error('No RESTResult tag found')
  }
}
