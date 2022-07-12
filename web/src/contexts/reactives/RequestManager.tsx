import { makeVar } from '@apollo/client'

import { LocalRESTRequest } from './locals'

type RequestManagerStatus = {
  status: 'IDLE' | 'STARTING' | 'SENDING'
  job: LocalRESTRequest | null
}

const requestManagerInitialStatus: RequestManagerStatus = {
  status: 'IDLE',
}

export const requestManagerVar = makeVar(requestManagerInitialStatus)

export const RequestManager = () => null
