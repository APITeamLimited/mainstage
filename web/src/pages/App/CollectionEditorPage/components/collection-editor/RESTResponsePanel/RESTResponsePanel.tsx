/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import CommentIcon from '@mui/icons-material/Comment'
import { useTheme } from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'src/lib/zustand-yjs'

import { SendingRequestAnimation } from 'src/components/app/utils/SendingRequestAnimation'
import { focusedResponseVar } from 'src/contexts/focused-response'
import { useYJSModule } from 'src/contexts/imports'
import { getFocusedElementKey } from 'src/contexts/reactives'

import { EmptyPanelMessage } from '../../../../../../components/app/utils/EmptyPanelMessage'

import { FailureResultPanel } from './subtype-panels/FailureResultPanel'
import { LoadingResponsePanel } from './subtype-panels/LoadingResponsePanel'
import { SuccessSingleResultPanel } from './subtype-panels/SuccessSingleResultPanel'

type RESTResponsePanelProps = {
  collectionYMap: YMap<any>
}

export const RESTResponsePanel = ({
  collectionYMap,
}: RESTResponsePanelProps) => {
  const Y = useYJSModule()

  const theme = useTheme()
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const collectionHook = useYMap(collectionYMap)

  const focusedResponse = useMemo(
    () => focusedResponseDict[getFocusedElementKey(collectionYMap)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseDict, collectionHook]
  )

  const responseHook = useYMap(focusedResponse ?? new Y.Map())

  const isExecutingRESTRequest = useMemo(() => {
    if (!focusedResponse) return false
    if (focusedResponse.get('__subtype') === 'LoadingResponse') return true
    return false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseHook])

  return (
    <>
      {isExecutingRESTRequest && <SendingRequestAnimation />}
      {!focusedResponse ? (
        <EmptyPanelMessage
          icon={
            <CommentIcon
              sx={{
                marginBottom: 2,
                width: 80,
                height: 80,
                color: theme.palette.action.disabled,
              }}
            />
          }
          primaryText="No response yet"
          secondaryMessages={[
            'Add a url above and hit send to see the response',
          ]}
        />
      ) : focusedResponse.get('__subtype') === 'LoadingResponse' ? (
        <LoadingResponsePanel focusedResponse={focusedResponse} />
      ) : focusedResponse.get('__subtype') === 'SuccessSingleResult' ? (
        <SuccessSingleResultPanel focusedResponse={focusedResponse} />
      ) : focusedResponse.get('__subtype') === 'FailureResult' ? (
        <FailureResultPanel focusedResponse={focusedResponse} />
      ) : (
        <EmptyPanelMessage
          primaryText="Invalid response type"
          secondaryMessages={[
            `Response type: ${focusedResponse.get(
              '__subtype'
            )} is not a valid response type`,
            'Please send a new request to get an updated response',
          ]}
        />
      )}
    </>
  )
}
