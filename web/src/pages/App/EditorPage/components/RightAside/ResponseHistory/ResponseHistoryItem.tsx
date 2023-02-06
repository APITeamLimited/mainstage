/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import { useTheme, ListItemIcon, IconButton, Tooltip } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { RequestListItem } from 'src/components/app/utils/RequestListItem'
import { updateFocusedResponse } from 'src/contexts/focused-response'
import {
  FocusedElementDictionary,
  getFocusedElementKey,
} from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

import { getNodeIcon } from '../../LeftAside/CollectionTree/Node/utils'

type ResponseHistoryItemProps = {
  responseYMap: YMap<any>
  collectionYMap: YMap<any>
  focusedResponseDict: FocusedElementDictionary
  handleDeleteResponse: () => void
}

export const ResponseHistoryItem = ({
  responseYMap,
  collectionYMap,
  focusedResponseDict,
  handleDeleteResponse,
}: ResponseHistoryItemProps) => {
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
      }
      return theme.palette.error.main
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responseHook, theme]
  )

  const sourceName = useMemo(
    () => responseYMap.get('sourceName'),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responseHook]
  )

  return (
    <RequestListItem
      isInFocus={
        focusedResponseDict[getFocusedElementKey(collectionYMap)]?.get('id') ===
        responseYMap.get('id')
      }
      onClick={() => updateFocusedResponse(focusedResponseDict, responseYMap)}
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
            size="medium"
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
      }
      icon={
        <ListItemIcon
          color={theme.palette.text.secondary}
          sx={{
            marginX: -1,
          }}
        >
          {getNodeIcon(responseYMap, true)}
        </ListItemIcon>
      }
      listItemTextSx={{
        color: statusCodeColor,
      }}
      primaryText={responseYMap.get('name')}
      secondaryText={sourceName}
    />
  )
}
