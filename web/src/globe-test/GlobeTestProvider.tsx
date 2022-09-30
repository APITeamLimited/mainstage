import { useEffect, useRef, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import jwt_decode from 'jwt-decode'
import { GetBearerPubkeyScopes } from 'types/graphql'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import { focusedResponseVar } from 'src/components/app/collection-editor/RESTResponsePanel'
import {
  useActiveEnvironmentYMap,
  useEnvironmentsYMap,
} from 'src/contexts/EnvironmentProvider'
import { activeEnvironmentVar, workspacesVar } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'
import {
  Bearer,
  GET_BEARER_PUBKEY__SCOPES_QUERY,
} from 'src/entity-engine/utils'

import { execute } from './execution'
import { jobQueueVar, QueuedJob, updateFilterQueue } from './lib'

export const GlobeTestProvider = () => {
  const { isAuthenticated } = useAuth()
  const [rawBearer, setRawBearer] = useState<string | null>(null)
  const [bearerExpiry, setBearerExpiry] = useState<number>(0)
  const environmentsYMap = useEnvironmentsYMap()
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const workspaces = useReactiveVar(workspacesVar)
  const jobQueue = useReactiveVar(jobQueueVar)
  const queueRef = useRef<QueuedJob[] | null>(null)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const workspace = useWorkspace()

  useReactiveVar(activeEnvironmentVar)
  useYMap(environmentsYMap || new Y.Map())
  useYMap(activeEnvironmentYMap || new Y.Map())

  // Requried for up to date state in callback
  queueRef.current = jobQueue

  // Get bearer token from gql query
  const { data } = useQuery<GetBearerPubkeyScopes>(
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
      // No bearer token, skipping execution
      return
    }

    jobQueue.forEach((job) => {
      if (
        job.__subtype === 'PendingLocalJob' &&
        job.jobStatus === 'LOCAL_CREATING'
      ) {
        jobQueueVar(
          updateFilterQueue(jobQueue ?? [], [
            { ...job, jobStatus: 'LOCAL_SUBMITTING' },
          ])
        )

        const didExecute = execute({
          queueRef,
          job,
          rawBearer,
          workspace: workspace as Y.Doc,
          focusedResponseDict,
        })
        if (!didExecute) {
          throw new Error('Failed to execute job')
        }
      }

      if (
        job.jobStatus === 'COMPLETED_SUCCESS' ||
        job.jobStatus === 'COMPLETED_FAILED'
      ) {
        // Remove completed jobs from queue
        jobQueueVar(jobQueue.filter((j) => j.localId !== job.localId))
      }
    })
  }, [focusedResponseDict, jobQueue, rawBearer, workspace])

  return <></>
}
