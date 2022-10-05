/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import CommentIcon from '@mui/icons-material/Comment'
import { useTheme } from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { SendingRequestAnimation } from 'src/components/app/utils/SendingRequestAnimation'
import { focusedResponseVar } from 'src/contexts/focused-response'
import { useYJSModule } from 'src/contexts/imports'
import { getFocusedElementKey } from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

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

  useEffect(() => {
    return () => console.log('unmounting RESTResponsePanel')
  }, [])

  const responseHook = useYMap(focusedResponse ?? new Y.Map())

  const focusedResponseId = useMemo(() => {
    if (!focusedResponse) {
      return null
    }
    return focusedResponse.get('id') as string
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseHook])

  return (
    <>
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
        <LoadingResponsePanel
          focusedResponse={focusedResponse}
          key={focusedResponseId}
        />
      ) : focusedResponse.get('__subtype') === 'SuccessSingleResult' ? (
        <SuccessSingleResultPanel
          focusedResponse={focusedResponse}
          key={focusedResponseId}
        />
      ) : focusedResponse.get('__subtype') === 'FailureResult' ? (
        <FailureResultPanel
          focusedResponse={focusedResponse}
          key={focusedResponseId}
        />
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
