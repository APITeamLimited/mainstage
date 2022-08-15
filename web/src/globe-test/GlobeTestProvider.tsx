import { useEffect, useRef, useState } from 'react'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { useReactiveVar } from '@apollo/client'
import jwt_decode, { JwtPayload } from 'jwt-decode'
import { GetBearerPubkeyScopes } from 'types/graphql'
import { useYMap } from 'zustand-yjs'

import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import {
  useActiveEnvironmentYMap,
  useEnvironmentsYMap,
} from 'src/contexts/EnvironmentProvider'
import { activeEnvironmentVar, workspacesVar } from 'src/contexts/reactives'
import {
  Bearer,
  GET_BEARER_PUBKEY__SCOPES_QUERY,
  processAuthData,
} from 'src/entity-engine/utils'

import { execute } from './execution'
import { jobQueueVar, QueuedJob, updateFilterQueue } from './lib'

export const GlobeTestProvider = () => {
  const { isAuthenticated } = useAuth()
  const [rawBearer, setRawBearer] = useState<string | null>(null)
  const [bearerExpiry, setBearerExpiry] = useState<number>(0)

  const environmentsYMap = useEnvironmentsYMap()
  const allActiveEnvironmentsDict = useReactiveVar(activeEnvironmentVar)
  const environments = useYMap(environmentsYMap || new Y.Map())
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironment = useYMap(activeEnvironmentYMap || new Y.Map())
  const workspaces = useReactiveVar(workspacesVar)
  const queueRef = useRef<QueuedJob[] | null>(null)

  // Requried for up to date state in callback
  queueRef.current = useReactiveVar(jobQueueVar)

  const jobQueue = useReactiveVar(jobQueueVar)

  // Get bearer token from gql query
  const { data, error } = useQuery<GetBearerPubkeyScopes>(
    GET_BEARER_PUBKEY__SCOPES_QUERY,
    {
      skip: bearerExpiry > Date.now() || !isAuthenticated,
    }
  )

  // Handle GetBearerPubkeyScopes updates
  useEffect(() => {
    if (!data) {
      // No data yet, just return
      return
    }

    const decodedToken: Bearer = jwt_decode(data.bearer) as unknown as Bearer

    if (!decodedToken.exp) throw 'No expiry in bearer token'
    if (!decodedToken.userId) throw 'No userId in bearer token'

    setBearerExpiry(decodedToken.exp * 1000)
    setRawBearer(data.bearer)
  }, [data, workspaces])

  // Scan for pending requests and start executing them
  useEffect(() => {
    if (rawBearer === '' || rawBearer === null) {
      console.warn('No bearer token, skipping execution')
      return
    }

    jobQueue.forEach((job) => {
      if (job.jobStatus === 'pending') {
        jobQueueVar(
          updateFilterQueue(jobQueue, [{ ...job, jobStatus: 'starting' }])
        )

        const didExecute = execute({ queueRef, job, rawBearer })
        if (!didExecute) {
          throw new Error('Failed to execute job')
        }
      }
    })
  }, [jobQueue, rawBearer])

  return <></>
}
