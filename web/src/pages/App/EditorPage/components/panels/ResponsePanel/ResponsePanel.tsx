/* eslint-disable @typescript-eslint/no-explicit-any */
import SendIcon from '@mui/icons-material/Send'
import { useTheme } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { useYJSModule } from 'src/contexts/imports'
import { useYMap } from 'src/lib/zustand-yjs'

import { FailureResultPanel } from './subtype-panels/FailureResultPanel'
import { LoadingResponsePanel } from './subtype-panels/LoadingResponsePanel'
import { SuccessMultipleResultPanel } from './subtype-panels/SuccessMultipleResultPanel'
import { SuccessSingleResultPanel } from './subtype-panels/SuccessSingleResultPanel'

type ResponsePanelProps = {
  responseYMap: YMap<any> | undefined
  parentTypename: string
}

export const ResponsePanel = ({
  responseYMap,
  parentTypename,
}: ResponsePanelProps) => {
  const Y = useYJSModule()
  const theme = useTheme()

  useYMap(responseYMap ?? new Y.Map())

  const showTest =
    parentTypename === 'Folder' || parentTypename === 'Collection'

  return (
    <>
      {!responseYMap || responseYMap.get('__subtype') === undefined ? (
        <EmptyPanelMessage
          icon={
            <SendIcon
              sx={{
                marginBottom: 2,
                width: 80,
                height: 80,
                color: theme.palette.action.disabled,
              }}
            />
          }
          primaryText={showTest ? 'No tests yet' : 'No response yet'}
          secondaryMessages={[
            showTest
              ? 'Run a test to see the result appear here'
              : 'Add a url above and hit send to see the response',
          ]}
        />
      ) : responseYMap.get('__subtype') === 'LoadingResponse' ? (
        <LoadingResponsePanel
          focusedResponse={responseYMap}
          key={`${responseYMap.get('id')}-${responseYMap.get('parentId')}`}
        />
      ) : responseYMap.get('__subtype') === 'SuccessSingleResult' ? (
        <SuccessSingleResultPanel
          focusedResponse={responseYMap}
          key={`${responseYMap.get('id')}-${responseYMap.get('parentId')}`}
        />
      ) : responseYMap.get('__subtype') === 'FailureResult' ? (
        <FailureResultPanel
          focusedResponse={responseYMap}
          key={`${responseYMap.get('id')}-${responseYMap.get('parentId')}`}
        />
      ) : responseYMap.get('__subtype') === 'SuccessMultipleResult' ? (
        <SuccessMultipleResultPanel
          focusedResponse={responseYMap}
          key={`${responseYMap.get('id')}-${responseYMap.get('parentId')}`}
        />
      ) : (
        <EmptyPanelMessage
          primaryText="Invalid response type"
          secondaryMessages={[
            `Response type: ${responseYMap.get(
              '__subtype'
            )} is not a valid response type`,
            'Please send a new request to get an updated response',
          ]}
        />
      )}
    </>
  )
}
