/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import { useTheme, ListItemIcon, IconButton, Tooltip } from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'zustand-yjs'

import { updateFocusedRESTResponse } from 'src/contexts/focused-response'
import {
  FocusedElementDictionary,
  getFocusedElementKey,
} from 'src/contexts/reactives'

import { RequestListItem } from '../../../../../../components/app/utils/RequestListItem'
import { getNodeIcon } from '../CollectionTree/Node/utils'

type RESTHistoryItemProps = {
  responseYMap: YMap<any>
  collectionYMap: YMap<any>
  focusedResponseDict: FocusedElementDictionary
  handleDeleteResponse: () => void
}

export const RESTHistoryItem = ({
  responseYMap,
  collectionYMap,
  focusedResponseDict,
  handleDeleteResponse,
}: RESTHistoryItemProps) => {
  const responseHook = useYMap(responseYMap)
  const theme = useTheme()

  const statusCodeColor = useMemo(
    () => {
      const statusCode = responseYMap.get('statusCode')
      if (!statusCode) return theme.palette.text.primary

      if (
        responseYMap.get('statusCode') >= 200 &&
        responseYMap.get('statusCode') < 300
      ) {
        return theme.palette.success.main
      } else if (responseYMap.get('statusCode') < 400) {
        return theme.palette.warning.main
      } else {
        return theme.palette.error.main
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responseHook, theme]
  )

  const pathname = useMemo(() => {
    try {
      return new URL(responseYMap.get('endpoint')).pathname
    } catch (error) {
      return ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseHook])

  return (
    <RequestListItem
      isInFocus={
        focusedResponseDict[getFocusedElementKey(collectionYMap)]?.get('id') ===
        responseYMap.get('id')
      }
      onClick={() =>
        updateFocusedRESTResponse(focusedResponseDict, responseYMap)
      }
      secondaryAction={
        <Tooltip title="Delete" placement="left">
          <IconButton
            edge="end"
            aria-label="Delete responseYMap"
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              handleDeleteResponse()
            }}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
      }
      icon={
        <ListItemIcon color={theme.palette.text.secondary}>
          {getNodeIcon(responseYMap, true)}
        </ListItemIcon>
      }
      listItemTextSx={{
        color: statusCodeColor,
      }}
      primaryText={responseYMap.get('name')}
      secondaryText={pathname}
    />
  )
}
