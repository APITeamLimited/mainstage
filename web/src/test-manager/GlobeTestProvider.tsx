import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import jwt_decode from 'jwt-decode'
import { GetBearerPubkeyScopes } from 'types/graphql'
import type { Doc as YDoc } from 'yjs'

import { useAuth } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import {
  useActiveEnvironmentYMap,
  useEnvironmentsYMap,
} from 'src/contexts/EnvironmentProvider'
import { focusedResponseVar } from 'src/contexts/focused-response'
import { useHashSumModule, useYJSModule } from 'src/contexts/imports'
import { activeEnvironmentVar, workspacesVar } from 'src/contexts/reactives'
import {
  useCollectionVariables,
  useEnvironmentVariables,
} from 'src/contexts/VariablesProvider'
import { useWorkspace } from 'src/entity-engine'
import {
  Bearer,
  GET_BEARER_PUBKEY__SCOPES_QUERY,
} from 'src/entity-engine/utils'
import { useYMap } from 'src/lib/zustand-yjs'

import { execute } from './execution'
import { jobQueueVar, updateFilterQueue } from './lib'

export const GlobeTestProvider = () => {
  const Y = useYJSModule()
  const hashSumModule = useHashSumModule()

  const { isAuthenticated } = useAuth()
  const [rawBearer, setRawBearer] = useState<string | null>(null)
  const [bearerExpiry, setBearerExpiry] = useState<number>(0)
  const environmentsYMap = useEnvironmentsYMap()
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const workspaces = useReactiveVar(workspacesVar)
  const jobQueue = useReactiveVar(jobQueueVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const workspace = useWorkspace()

  useReactiveVar(activeEnvironmentVar)
  useYMap(environmentsYMap || new Y.Map())
  useYMap(activeEnvironmentYMap || new Y.Map())

  const collectionContext = useCollectionVariables()
  const environmentContext = useEnvironmentVariables()

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
          job,
          rawBearer,
          workspace: workspace as YDoc,
          focusedResponseDict,
          environmentContext,
          collectionContext,
          hashSumModule,
          activeEnvironmentYMap,
        })
        if (!didExecute) {
          throw new Error('Failed to execute job')
        }
      }

      if (
        job.jobStatus === 'COMPLETED_SUCCESS' ||
        job.jobStatus === 'COMPLETED_FAILURE'
      ) {
        // Remove completed jobs from queue
        jobQueueVar(jobQueue.filter((j) => j.localId !== job.localId))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collectionContext,
    environmentContext,
    focusedResponseDict,
    jobQueue,
    rawBearer,
    workspace,
  ])

  return <></>
}
